const COLORS = {
  galliBlue: '#00DDFF',
  ocean: '#E0F7FA',
  land: '#FFFFFF',
  landStroke: '#CFD8DC',
};

export function getAmChartsHTML(visitedCountries: string[]) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body { margin: 0; padding: 0; background-color: transparent; overflow: hidden; }
      #chartdiv { width: 100vw; height: 100vh; }
      a[href*="amcharts.com"] { display: none !important; visibility: hidden !important; opacity: 0 !important; }
    </style>
    <script src="https://cdn.amcharts.com/lib/5/index.js"></script>
    <script src="https://cdn.amcharts.com/lib/5/map.js"></script>
    <script src="https://cdn.amcharts.com/lib/5/geodata/worldLow.js"></script>
    <script src="https://cdn.amcharts.com/lib/5/themes/Animated.js"></script>
  </head>
  <body>
    <div id="chartdiv"></div>
    <script>
      am5.ready(function() {
        var root = am5.Root.new("chartdiv");
        if (root._logo) { root._logo.dispose(); }
        root.setThemes([am5themes_Animated.new(root)]);

        var chart = root.container.children.push(am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: "rotateY",
          projection: am5map.geoOrthographic(),
          paddingBottom: 0,
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          homeZoomLevel: 1,
          minZoomLevel: 1,
          maxZoomLevel: 32,
          homeGeoPoint: { latitude: 10, longitude: 0 }
        }));

        var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
        backgroundSeries.mapPolygons.template.setAll({
          fill: am5.color("${COLORS.ocean}"),
          fillOpacity: 1,
          strokeOpacity: 0,
          strokeWidth: 0
        });
        backgroundSeries.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });

        var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_worldLow,
          exclude: ["AQ"]
        }));

        var visited = ${JSON.stringify(visitedCountries)};

        polygonSeries.mapPolygons.template.setAll({
          tooltipText: "{name}",
          toggleKey: "active",
          interactive: true,
          fill: am5.color("${COLORS.land}"),
          stroke: am5.color("${COLORS.landStroke}"),
          strokeWidth: 1,
          templateField: "polygonSettings"
        });

        polygonSeries.mapPolygons.template.states.create("hover", {
          fill: am5.color("${COLORS.galliBlue}"),
          fillOpacity: 0.2
        });

        polygonSeries.events.on("datavalidated", function () {
          polygonSeries.mapPolygons.each(function(polygon) {
            var dataItem = polygon.dataItem;
            var id = dataItem.get("id");
            if (visited.includes(id)) {
              polygon.set("fill", am5.color("${COLORS.galliBlue}"));
              polygon.set("fillOpacity", 1);
              polygon.set("stroke", am5.color("${COLORS.galliBlue}"));
            }
          });
        });

        var isFocused = false;
        var rotationAnim;
        var rotationTimeout;

        function startAutoRotation() {
          if (rotationAnim) return;
          rotationAnim = chart.animate({
            key: "rotationX",
            from: chart.get("rotationX"),
            to: chart.get("rotationX") - 360,
            duration: 60000,
            loops: Infinity,
            easing: am5.ease.linear
          });
        }

        function stopAutoRotation() {
          if (rotationAnim) {
            rotationAnim.stop();
            rotationAnim = null;
          }
          if (rotationTimeout) {
            clearTimeout(rotationTimeout);
            rotationTimeout = null;
          }
        }

        function flyToGeoPoint(lat, lon, zoom) {
          stopAutoRotation();
          var currentRx = chart.get("rotationX");
          var targetRx = -lon;
          var targetRy = -lat;
          while (targetRx - currentRx > 180) targetRx -= 360;
          while (targetRx - currentRx < -180) targetRx += 360;
          var easing = am5.ease.out(am5.ease.cubic);
          var duration = 1200;
          chart.animate({ key: "rotationX", to: targetRx, duration: duration, easing: easing });
          chart.animate({ key: "rotationY", to: targetRy, duration: duration, easing: easing });
          chart.animate({ key: "zoomLevel", to: zoom, duration: duration, easing: easing });
        }

        function getOptimalZoom(geometry) {
          var minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
          function traverse(arr) {
            if (arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
              var lon = arr[0]; var lat = arr[1];
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
              if (lon < minLon) minLon = lon;
              if (lon > maxLon) maxLon = lon;
            } else { arr.forEach(traverse); }
          }
          if (geometry && geometry.coordinates) { traverse(geometry.coordinates); }
          var diffLat = Math.abs(maxLat - minLat);
          var diffLon = Math.abs(maxLon - minLon);
          var maxDiff = Math.max(diffLat, diffLon);
          if (maxDiff > 60) return 1.5;
          if (maxDiff > 25) return 2.5;
          if (maxDiff > 8) return 4;
          return 6;
        }

        chart.events.on("pointerdown", function() { stopAutoRotation(); });
        chart.events.on("pointerup", function() {
          if (!isFocused) {
            stopAutoRotation();
            rotationTimeout = setTimeout(startAutoRotation, 500);
          }
        });

        polygonSeries.mapPolygons.template.events.on("click", function(ev) {
          var dataItem = ev.target.dataItem;
          var id = dataItem.get("id");
          var name = dataItem.get("name");
          if (!dataItem) return;
          isFocused = true;
          polygonSeries.mapPolygons.each(function(poly) {
            if (poly !== ev.target) {
              if (visited.includes(poly.dataItem.get("id"))) {
                poly.animate({ key: "fillOpacity", to: 0.3, duration: 500 });
              }
            } else {
              poly.animate({ key: "fillOpacity", to: 1, duration: 500 });
            }
          });
          var centroid = ev.target.geoCentroid();
          if (centroid) {
            var geometry = dataItem.get("geometry");
            var zoom = getOptimalZoom(geometry);
            flyToGeoPoint(centroid.latitude, centroid.longitude, zoom);
          }
          var message = JSON.stringify({ type: 'COUNTRY_SELECTED', id: id, name: name });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
          } else {
            window.parent.postMessage(message, "*");
          }
        });

        window.resetGlobe = function() {
          isFocused = false;
          polygonSeries.mapPolygons.each(function(polygon) {
            var id = polygon.dataItem.get("id");
            var isVisited = visited.includes(id);
            polygon.animate({ key: "fillOpacity", to: isVisited ? 1 : 1, duration: 500 });
          });
          flyToGeoPoint(10, 0, 1);
          stopAutoRotation();
          rotationTimeout = setTimeout(startAutoRotation, 1250);
        };

        window.zoomToContinent = function(countryCodes) {
          isFocused = true;
          polygonSeries.mapPolygons.each(function(polygon) {
            var id = polygon.dataItem.get("id");
            if (visited.includes(id)) {
              polygon.animate({ key: "fillOpacity", to: 1, duration: 500 });
            }
          });
          var sumLat = 0; var sumLon = 0; var count = 0;
          polygonSeries.mapPolygons.each(function(poly) {
            if (countryCodes.includes(poly.dataItem.get("id"))) {
              var centroid = poly.geoCentroid();
              if (centroid) { sumLat += centroid.latitude; sumLon += centroid.longitude; count++; }
            }
          });
          if (count > 0) { flyToGeoPoint(sumLat / count, sumLon / count, 2.0); }
        };

        function handleMessage(event) {
          try {
            var data = event.data;
            if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e){} }
            if (!data) return;
            if (data.type === 'RESET_GLOBE') {
              window.resetGlobe();
            } else if (data.type === 'ZOOM_CONTINENT') {
              window.zoomToContinent(data.countryCodes);
            }
          } catch(e) {}
        }

        window.addEventListener("message", handleMessage);
        document.addEventListener("message", handleMessage);
        startAutoRotation();
      });
    </script>
  </body>
</html>`;
}
