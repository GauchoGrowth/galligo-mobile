/**
 * ISO Code to Country Name Mapping
 *
 * Maps ISO 3166-1 alpha-2 codes to country names as they appear
 * in the Natural Earth TopoJSON data (world-atlas).
 *
 * This is needed because the TopoJSON only includes country names,
 * not ISO codes.
 */

export const ISO_TO_COUNTRY_NAME: Record<string, string> = {
  // North America
  us: 'United States of America',
  ca: 'Canada',
  mx: 'Mexico',

  // South America
  ar: 'Argentina',
  br: 'Brazil',
  cl: 'Chile',
  co: 'Colombia',
  pe: 'Peru',
  ve: 'Venezuela',
  uy: 'Uruguay',
  py: 'Paraguay',
  bo: 'Bolivia',
  ec: 'Ecuador',
  gy: 'Guyana',
  sr: 'Suriname',

  // Europe
  fr: 'France',
  es: 'Spain',
  de: 'Germany',
  it: 'Italy',
  gb: 'United Kingdom',
  pt: 'Portugal',
  nl: 'Netherlands',
  be: 'Belgium',
  ch: 'Switzerland',
  at: 'Austria',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  fi: 'Finland',
  pl: 'Poland',
  cz: 'Czechia',
  gr: 'Greece',
  ro: 'Romania',
  hu: 'Hungary',
  ie: 'Ireland',
  sk: 'Slovakia',
  bg: 'Bulgaria',
  hr: 'Croatia',
  si: 'Slovenia',
  lt: 'Lithuania',
  lv: 'Latvia',
  ee: 'Estonia',
  rs: 'Serbia',
  is: 'Iceland',

  // Asia
  cn: 'China',
  jp: 'Japan',
  in: 'India',
  kr: 'South Korea',
  th: 'Thailand',
  vn: 'Vietnam',
  id: 'Indonesia',
  my: 'Malaysia',
  sg: 'Singapore',
  ph: 'Philippines',
  pk: 'Pakistan',
  bd: 'Bangladesh',
  kz: 'Kazakhstan',
  uz: 'Uzbekistan',
  tr: 'Turkey',
  sa: 'Saudi Arabia',
  ae: 'United Arab Emirates',
  il: 'Israel',
  iq: 'Iraq',
  ir: 'Iran',
  af: 'Afghanistan',
  np: 'Nepal',
  lk: 'Sri Lanka',
  mm: 'Myanmar',
  kh: 'Cambodia',
  la: 'Laos',
  mn: 'Mongolia',

  // Africa
  za: 'South Africa',
  eg: 'Egypt',
  ng: 'Nigeria',
  ke: 'Kenya',
  et: 'Ethiopia',
  tz: 'Tanzania',
  dz: 'Algeria',
  ma: 'Morocco',
  tn: 'Tunisia',
  ly: 'Libya',
  sd: 'Sudan',
  gh: 'Ghana',
  ug: 'Uganda',
  ao: 'Angola',
  mz: 'Mozambique',
  mg: 'Madagascar',
  cm: 'Cameroon',
  ci: "Côte d'Ivoire",
  ne: 'Niger',
  ml: 'Mali',
  zw: 'Zimbabwe',
  sn: 'Senegal',
  zm: 'Zambia',
  td: 'Chad',
  so: 'Somalia',
  rw: 'Rwanda',
  bj: 'Benin',
  tn: 'Tunisia',
  gn: 'Guinea',

  // Oceania
  au: 'Australia',
  nz: 'New Zealand',
  pg: 'Papua New Guinea',
  fj: 'Fiji',

  // Central America & Caribbean
  gt: 'Guatemala',
  cu: 'Cuba',
  do: 'Dominican Rep.',
  ht: 'Haiti',
  hn: 'Honduras',
  ni: 'Nicaragua',
  cr: 'Costa Rica',
  pa: 'Panama',
  sv: 'El Salvador',
  jm: 'Jamaica',

  // Middle East
  jo: 'Jordan',
  lb: 'Lebanon',
  sy: 'Syria',
  ye: 'Yemen',
  om: 'Oman',
  kw: 'Kuwait',
  qa: 'Qatar',
  bh: 'Bahrain',

  // Other
  ru: 'Russia',
  ua: 'Ukraine',
  by: 'Belarus',
  kp: 'North Korea',
};

/**
 * Converts ISO alpha-2 code to country name as it appears in TopoJSON
 *
 * @param isoCode - ISO 3166-1 alpha-2 code (e.g., "us", "fr")
 * @returns Country name or null if not found
 */
export function getCountryNameFromISO(isoCode: string): string | null {
  const lowerCode = isoCode.toLowerCase();
  return ISO_TO_COUNTRY_NAME[lowerCode] || null;
}

/**
 * Converts country name to ISO alpha-2 code
 *
 * @param countryName - Country name as it appears in TopoJSON
 * @returns ISO code or null if not found
 */
export function getISOFromCountryName(countryName: string): string | null {
  const entry = Object.entries(ISO_TO_COUNTRY_NAME).find(
    ([_, name]) => name.toLowerCase() === countryName.toLowerCase()
  );
  return entry ? entry[0] : null;
}
