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
      addressComponents?: { zip?: string };
      geographies?: Geographies;
    }>;
  };
}

interface CoordinatesResponse {
  result?: { geographies?: Geographies };
}

export interface CensusGeography {
  stateFips?: string; // ex: "42"
  countyFips?: string; // ex: "101" (3 digits)
  countyName?: string;
  tract?: string;
}

export interface GeocodeResult extends CensusGeography {
  matchedAddress: string;
  latitude: number;
  longitude: number;
  zip?: string;
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
  // prefer the exact "Counties"/"Census Tracts" layers, then fall back to a looser match
  // so "County Subdivisions" is not picked by mistake
  const county = pickLayer(geos, /^count(y|ies)$/i) ?? pickLayer(geos, /count/i);
  const tract = pickLayer(geos, /^census tracts?$/i) ?? pickLayer(geos, /tract/i);
  return {
    stateFips: county?.STATE,
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

  return {
    matchedAddress: match.matchedAddress,
    latitude: match.coordinates.y,
    longitude: match.coordinates.x,
    zip: match.addressComponents?.zip,
    ...readGeographies(match.geographies),
  };
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
