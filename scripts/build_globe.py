"""
Utility script to rebuild the 3D globe inside Blender.

It downloads the Natural Earth Admin 0 Countries dataset, triangulates every
country (handling multipolygons and interior holes via Mapbox Earcut), assigns
materials, and exports the finished globe to assets/3d/globe_interactive.glb.

Run from Blender's Python environment, e.g.

  bpy.ops.script.python_file_run(filepath="scripts/build_globe.py")
"""

from __future__ import annotations

import math
import os
import pathlib
import tempfile
import urllib.request
import zipfile
import io
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple

import bpy


def ensure_packages() -> None:
  """Install shapefile/numpy/mapbox-earcut inside Blender if missing."""

  def pip_install(*packages: str) -> None:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", *packages])

  try:
    import shapefile  # type: ignore
    import numpy  # type: ignore
    import mapbox_earcut  # type: ignore
  except ImportError:
    pip_install("pyshp", "numpy", "mapbox-earcut")


ensure_packages()

import numpy as np  # type: ignore  # noqa: E402
import shapefile  # type: ignore  # noqa: E402
import mapbox_earcut as earcut  # type: ignore  # noqa: E402


DATASETS = {
  "110m": "https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip",
  "50m": "https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip",
}


@dataclass
class Ring:
  coords: List[Tuple[float, float]]
  area: float
  bbox: Tuple[float, float, float, float]
  parent: Optional["Ring"] = None
  children: List["Ring"] = field(default_factory=list)
  depth: Optional[int] = None


def download_dataset(resolution: str = "110m") -> pathlib.Path:
  """Download and extract the Natural Earth dataset if needed."""
  cache_root = pathlib.Path(tempfile.gettempdir()) / "galligo_globe_cache" / resolution
  shapefile_name = f"ne_{resolution}_admin_0_countries.shp"
  shapefile_path = cache_root / shapefile_name
  if shapefile_path.exists():
    return shapefile_path

  cache_root.mkdir(parents=True, exist_ok=True)
  url = DATASETS[resolution]
  print(f"Downloading Natural Earth {resolution} dataset…")
  req = urllib.request.Request(url, headers={"User-Agent": "BlenderMCP/1.0"})
  with urllib.request.urlopen(req) as resp:
    data = resp.read()
  with zipfile.ZipFile(io.BytesIO(data)) as zf:
    zf.extractall(cache_root)
  print(f"Dataset extracted to {cache_root}")
  return shapefile_path


def signed_area(coords: Sequence[Tuple[float, float]]) -> float:
  area = 0.0
  for i in range(len(coords)):
    x1, y1 = coords[i]
    x2, y2 = coords[(i + 1) % len(coords)]
    area += x1 * y2 - x2 * y1
  return area / 2.0


def point_in_polygon(point: Tuple[float, float], ring: Sequence[Tuple[float, float]]) -> bool:
  x, y = point
  inside = False
  j = len(ring) - 1
  for i in range(len(ring)):
    xi, yi = ring[i]
    xj, yj = ring[j]
    intersects = ((yi > y) != (yj > y)) and (
      x < (xj - xi) * (y - yi) / ((yj - yi) + 1e-12) + xi
    )
    if intersects:
      inside = not inside
    j = i
  return inside


def classify_rings(rings: List[Ring]) -> None:
  """Assign nesting depth to every ring (even=outer, odd=hole)."""
  rings.sort(key=lambda r: r.area, reverse=True)
  for idx, ring in enumerate(rings):
    for candidate in rings[:idx]:
      bx1, by1, bx2, by2 = candidate.bbox
      ix1, iy1, ix2, iy2 = ring.bbox
      if ix1 < bx1 or iy1 < by1 or ix2 > bx2 or iy2 > by2:
        continue
      if point_in_polygon(ring.coords[0], candidate.coords):
        ring.parent = candidate
        candidate.children.append(ring)
        break

  def assign(node: Ring, depth: int) -> None:
    node.depth = depth
    for child in node.children:
      assign(child, depth + 1)

  for ring in rings:
    if ring.parent is None and ring.depth is None:
      assign(ring, 0)


def project_to_sphere(lon: float, lat: float, radius: float) -> Tuple[float, float, float]:
  lon_rad = math.radians(lon)
  lat_rad = math.radians(lat)
  x = radius * math.cos(lat_rad) * math.cos(lon_rad)
  y = radius * math.cos(lat_rad) * math.sin(lon_rad)
  z = radius * math.sin(lat_rad)
  return x, y, z


def ensure_scene_objects() -> Tuple[bpy.types.Object, bpy.types.Object, bpy.types.Material]:
  scene = bpy.context.scene
  root = bpy.data.objects.get("GLOBE_Root")
  if root is None:
    root = bpy.data.objects.new("GLOBE_Root", None)
    scene.collection.objects.link(root)

  ocean = bpy.data.objects.get("GLOBE_Ocean")
  if ocean is None:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=10.0, segments=64, ring_count=32, location=(0, 0, 0))
    ocean = bpy.context.active_object
    ocean.name = "GLOBE_Ocean"
    for poly in ocean.data.polygons:
      poly.use_smooth = True
    ocean.parent = root

  countries_parent = bpy.data.objects.get("GLOBE_Countries")
  if countries_parent is None:
    countries_parent = bpy.data.objects.new("GLOBE_Countries", None)
    scene.collection.objects.link(countries_parent)
    countries_parent.parent = root
  else:
    for child in list(countries_parent.children):
      if child.name.startswith("GEO-"):
        bpy.data.objects.remove(child, do_unlink=True)

  country_mat = bpy.data.materials.get("MAT_UnvisitedCountry")
  if country_mat is None:
    country_mat = bpy.data.materials.new(name="MAT_UnvisitedCountry")

  country_mat.use_nodes = True
  country_mat.blend_method = "OPAQUE"
  country_mat.use_backface_culling = False

  bsdf = country_mat.node_tree.nodes.get("Principled BSDF")
  if bsdf:
    bsdf.inputs["Base Color"].default_value = (0xE0 / 255, 0xE0 / 255, 0xE0 / 255, 1)
    bsdf.inputs["Roughness"].default_value = 0.65
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular" in bsdf.inputs:
      bsdf.inputs["Specular"].default_value = 0.15
    bsdf.inputs["Alpha"].default_value = 1.0

  return root, ocean, countries_parent, country_mat


def enforce_normals_and_shading(obj: bpy.types.Object) -> None:
  if obj.type != "MESH":
    return

  bpy.ops.object.select_all(action="DESELECT")
  obj.select_set(True)
  bpy.context.view_layer.objects.active = obj
  bpy.ops.object.shade_smooth()
  entered_edit = False
  try:
    bpy.ops.object.mode_set(mode="EDIT")
    entered_edit = True
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
  except RuntimeError:
    pass
  finally:
    if entered_edit:
      bpy.ops.object.mode_set(mode="OBJECT")


def build_country_mesh(
  iso_code: str,
  country_name: str,
  shapes: List[shapefile._Shape],  # type: ignore
  parent: bpy.types.Object,
  country_mat: bpy.types.Material,
  sphere_radius: float,
) -> int:
  rings: List[Ring] = []
  for shape in shapes:
    points = shape.points
    part_indices = list(shape.parts) + [len(points)]
    for start, end in zip(part_indices[:-1], part_indices[1:]):
      coords = points[start:end]
      if len(coords) >= 3 and coords[0] == coords[-1]:
        coords = coords[:-1]
      if len(coords) < 3:
        continue
      bbox = (
        min(p[0] for p in coords),
        min(p[1] for p in coords),
        max(p[0] for p in coords),
        max(p[1] for p in coords),
      )
      rings.append(Ring(coords=list(coords), area=abs(signed_area(coords)), bbox=bbox))

  if not rings:
    return 0

  classify_rings(rings)

  verts: List[Tuple[float, float, float]] = []
  faces: List[Tuple[int, int, int]] = []
  triangle_count = 0

  for ring in rings:
    if ring.depth is None or ring.depth % 2 != 0:
      continue
    holes = [
      child for child in ring.children if child.depth is not None and child.depth == ring.depth + 1
    ]
    all_rings = [ring] + holes
    flat_coords: List[Tuple[float, float]] = []
    ring_indices: List[int] = []
    for r in all_rings:
      flat_coords.extend(r.coords)
      ring_indices.append(len(flat_coords))

    verts2d = np.array(flat_coords, dtype=np.float64)
    if verts2d.shape[0] < 3:
      continue
    rings_arr = np.array(ring_indices, dtype=np.uint32)

    try:
      tri_idx = earcut.triangulate_float64(verts2d, rings_arr)
    except Exception as err:
      print(f"Warning: Earcut failed for {iso_code}; skipped one polygon ({err})")
      continue
    if tri_idx.size == 0:
      print(f"Warning: Earcut produced no triangles for {iso_code}; skipped one polygon")
      continue

    start_index = len(verts)
    for lon, lat in verts2d:
      verts.append(project_to_sphere(lon, lat, sphere_radius))

    tris = tri_idx.tolist()
    for a, b, c in zip(tris[0::3], tris[1::3], tris[2::3]):
      faces.append((start_index + a, start_index + b, start_index + c))
    triangle_count += len(tris) // 3

  if not faces:
    return 0

  mesh = bpy.data.meshes.new(f"GEO-{iso_code}_Mesh")
  mesh.from_pydata(verts, [], faces)
  mesh.validate(verbose=False)
  mesh.update(calc_edges=True)
  try:
    mesh.calc_loop_triangles()
  except AttributeError:
    pass
  try:
    mesh.calc_normals_split()
    mesh.normals_split_custom_set(None)
  except AttributeError:
    try:
      mesh.calc_normals()
    except AttributeError:
      pass

  obj = bpy.data.objects.new(f"GEO-{iso_code}", mesh)
  obj["country_code"] = iso_code
  obj["country_name"] = country_name
  obj.parent = parent
  bpy.context.scene.collection.objects.link(obj)

  for poly in mesh.polygons:
    poly.use_smooth = True

  if mesh.materials:
    mesh.materials[0] = country_mat
  else:
    mesh.materials.append(country_mat)

  if hasattr(obj.data, "use_auto_smooth"):
    obj.data.use_auto_smooth = False
  enforce_normals_and_shading(obj)

  print(f"{iso_code}: {triangle_count} tris")
  return triangle_count


def build_globe(use_50m: bool = False) -> None:
  shapefile_path = download_dataset("50m" if use_50m else "110m")
  reader = shapefile.Reader(str(shapefile_path))

  fields = reader.fields[1:]
  field_names = [f[0] for f in fields]
  try:
    iso_idx = field_names.index("ISO_A3")
  except ValueError:
    iso_idx = field_names.index("ADM0_A3")
  name_idx = (
    field_names.index("NAME")
    if "NAME" in field_names
    else field_names.index("ADMIN")
  )

  grouped: Dict[str, Dict[str, object]] = {}
  skipped: List[str] = []
  for shape_rec in reader.iterShapeRecords():
    iso_code = str(shape_rec.record[iso_idx]).strip()
    if iso_code in {"", "-99"}:
      skipped.append(shape_rec.record[name_idx])
      continue
    bucket = grouped.setdefault(
      iso_code,
      {"name": shape_rec.record[name_idx], "shapes": []},
    )
    bucket["shapes"].append(shape_rec.shape)  # type: ignore[arg-type]

  root, ocean, countries_parent, country_mat = ensure_scene_objects()

  sphere_radius = 10.05
  total_triangles = 0
  critical_countries = {"USA", "BRA", "RUS", "CHN"}
  critical_stats: Dict[str, int] = {}
  for iso_code, data in grouped.items():
    tris = build_country_mesh(
      iso_code,
      str(data["name"]),
      data["shapes"],  # type: ignore[arg-type]
      countries_parent,
      country_mat,
      sphere_radius,
    )
    if iso_code in critical_countries:
      critical_stats[iso_code] = tris
    total_triangles += tris

  if skipped:
    skipped_list = ", ".join(sorted(set(skipped)))
    print(f"Skipped shapes missing ISO codes: {skipped_list}")

  print(f"Total countries created: {len(grouped)}")
  print(f"Total triangle count: {total_triangles + len(ocean.data.polygons)}")

  missing = critical_countries - critical_stats.keys()
  if missing:
    print(f"WARNING: Missing triangle stats for {', '.join(sorted(missing))}")
  else:
    for iso in sorted(critical_countries):
      print(f"Verified {iso}: {critical_stats[iso]} tris")

  project_root = resolve_project_root()
  export_path = project_root / "assets" / "3d" / "globe_interactive.glb"
  export_path.parent.mkdir(parents=True, exist_ok=True)

  bpy.ops.export_scene.gltf(
    filepath=str(export_path),
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    use_selection=False,
  )
  size_bytes = export_path.stat().st_size
  size_label = (
    f"{size_bytes / (1024 * 1024):.2f} MB"
    if size_bytes >= 1024 * 1024
    else f"{size_bytes / 1024:.1f} KB"
  )
  print(f"Exported GLB to {export_path} ({size_label})")


def resolve_project_root() -> pathlib.Path:
  env_root = os.environ.get("GALLIGO_PROJECT_ROOT")
  if env_root:
    candidate = pathlib.Path(env_root).expanduser().resolve()
    if candidate.exists():
      return candidate

  script_path = globals().get("__file__")
  if script_path:
    return pathlib.Path(script_path).resolve().parents[1]

  for start in (
    pathlib.Path(bpy.path.abspath("//")).resolve(),
    pathlib.Path.cwd().resolve(),
  ):
    repo_root = find_repo_root(start)
    if repo_root:
      return repo_root

  raise RuntimeError("Could not determine project root. Set GALLIGO_PROJECT_ROOT.")


def find_repo_root(start: pathlib.Path) -> Optional[pathlib.Path]:
  path = start
  while True:
    if (path / "package.json").exists() and (path / "assets").exists():
      return path
    if path.parent == path:
      return None
    path = path.parent


if __name__ == "__main__":
  build_globe(use_50m=False)
