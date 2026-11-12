/**
 * Census Geocoder API
 *
 * - Converts a street address (or coordinates) into coordinates plus Census
 * geography codes (state FIPS, county FIPS, tract)
 * - Census has to run on the backend, not on browser
 * - No API key needed
 *
 * Privacy: addresses are personal information. Do not log or store!
 * Note: x is longitude, y is latitude (opposite of the usual order)
 */

const BASE_URL = 'https://geocoding.geo.census.gov/geocoder';
const BENCHMARK = 'Public_AR_Current'; // which address data set to match against
const VINTAGE = 'Current_Current'; // which geography boundaries to use
const TIMEOUT_MS = 10_000;

type GeoRecord = Record<string, string>;
type Geographies = Record<string, GeoRecord[]>;

interface AddressResponse {
  result?: {
    addressMatches?: Array<{
      matchedAddress: string;
      coordinates: { x: number; y: number };
      addressComponents?: { zip?: string; city?: string; state?: string };
      geographies?: Geographies;
    }>;
  };
}

// TIGERweb ZCTA layer response (ZIP Code Tabulation Areas)
interface ZctaResponse {
  features?: Array<{ attributes?: { ZCTA5?: string; INTPTLAT?: string; INTPTLON?: string } }>;
  error?: { message?: string };
}

interface CoordinatesResponse {
  result?: { geographies?: Geographies };
}

export interface CensusGeography {
  stateFips?: string; // ex: "42"
  stateCode?: string; // ex: "PA"
  countyFips?: string; // ex: "101" (3 digits)
  countyName?: string;
  tract?: string;
}

export interface GeocodeResult extends CensusGeography {
  matchedAddress: string;
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
}

// result of a ZIP-only lookup. The point is the ZIP area's internal point, not a home
export interface ZipLookupResult extends CensusGeography {
  zip: string;
  latitude: number;
  longitude: number;
}

// finds the first record in a layer whose name matches
// layer names are keys of the response
function pickLayer(geos: Geographies | undefined, pattern: RegExp): GeoRecord | undefined {
  if (!geos) return undefined;
  const key = Object.keys(geos).find((name) => pattern.test(name));
  return key ? geos[key]?.[0] : undefined;
}

// pulls the pieces we care about out of the geographies object
function readGeographies(geos: Geographies | undefined): CensusGeography {
  // exact "Counties" layer only
  // no county means no match, and the quiz falls back to the ZIP lookup
  const county = pickLayer(geos, /^count(y|ies)$/i);
  const tract = pickLayer(geos, /^census tracts?$/i) ?? pickLayer(geos, /tract/i);
  // get state abbreviation from the States layer
  const state = pickLayer(geos, /^states$/i);
  return {
    stateFips: county?.STATE,
    stateCode: state?.STUSAB,
    countyFips: county?.COUNTY,
    countyName: county?.NAME,
    tract: tract?.TRACT,
  };
}

async function getJson<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  const res = await fetch(`${BASE_URL}/${path}?${query}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Census Geocoder request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// address -> coordinates + county/tract. Returns null when the address has no match
// include city/state or ZIP in the string for the best results
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (trimmed.length < 5 || trimmed.length > 200) {
    throw new Error('address must be between 5 and 200 characters');
  }

  const json = await getJson<AddressResponse>('geographies/onelineaddress', {
    address: trimmed,
    benchmark: BENCHMARK,
    vintage: VINTAGE,
    format: 'json',
  });

  const match = json.result?.addressMatches?.[0];
  if (!match) return null;

  // read geographies once, add city and stateCode
  const geography = readGeographies(match.geographies);
  return {
    matchedAddress: match.matchedAddress,
    latitude: match.coordinates.y,
    longitude: match.coordinates.x,
    zip: match.addressComponents?.zip,
    city: match.addressComponents?.city,
    ...geography,
    // fall back to the parsed state if the States layer was not returned
    stateCode: geography.stateCode ?? match.addressComponents?.state,
  };
}

// NEW: everything from here to the end of geocodeZip
// ZIP -> county
// the Census Geocoder cannot match a ZIP code on its own as it needs a street
// we ask TIGERweb for the ZIP area's internal point, then look that point up
// A ZIP can cross county lines; this returns the county that holds the internal point
// returns null when the ZIP is not a Census ZIP Code Tabulation Area (ex: PO-box-only ZIPs)
const ZCTA_URL =
  'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1/query';

export async function geocodeZip(zip: string): Promise<ZipLookupResult | null> {
  const trimmed = zip.trim();
  if (!/^\d{5}$/.test(trimmed)) {
    throw new Error('zip must be 5 digits');
  }

  const query = new URLSearchParams({
    where: `ZCTA5='${trimmed}'`, // safe: validated as 5 digits above
    outFields: 'ZCTA5,INTPTLAT,INTPTLON',
    returnGeometry: 'false',
    f: 'json',
  });
  const res = await fetch(`${ZCTA_URL}?${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`TIGERweb request failed: ${res.status}`);
  }
  const json = (await res.json()) as ZctaResponse;
  if (json.error) {
    throw new Error(`TIGERweb request failed: ${json.error.message ?? 'unknown error'}`);
  }

  const attrs = json.features?.[0]?.attributes;
  // values look like "+39.9520613" / "-075.1580448"
  const latitude = Number.parseFloat(attrs?.INTPTLAT ?? '');
  const longitude = Number.parseFloat(attrs?.INTPTLON ?? '');
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const geography = await geocodeCoordinates(latitude, longitude);
  if (!geography) return null;

  return { zip: trimmed, latitude, longitude, ...geography };
}

// coordinates -> county/tract (for a "use my location" feature). Returns null if nothing is found
export async function geocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<CensusGeography | null> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error('latitude/longitude out of range');
  }

  const json = await getJson<CoordinatesResponse>('geographies/coordinates', {
    x: longitude, // x is longitude
    y: latitude, // y is latitude
    benchmark: BENCHMARK,
    vintage: VINTAGE,
    format: 'json',
  });

  const geography = readGeographies(json.result?.geographies);
  return geography.countyFips ? geography : null;
}
