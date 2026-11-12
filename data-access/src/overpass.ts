// Overpass (OpenStreetMap) API

// findResources() returns hospitals, clinics, pharmacies, shelters and emergency points near a coordinate, nearest first

// The public Overpass server is shared and rate limited per IP (HTTP 429), so:
//  - requests are small (radius capped, short server timeout)
//  - results are cached in memory (best effort; serverless instances each have their own)
//  - never send requests in parallel (identical searches share one request, and all requests go through a one-at-a-time queue)
//  - if one server is busy or down, try the next one in ENDPOINTS (one at a time)

// The UI must also show the attribution "© OpenStreetMap contributors" (ODbL license)

// tried in order, one at a time
// re-check with a quick curl if this order ever needs to change
const ENDPOINTS = [
  'https://gall.openstreetmap.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
// busy or temporarily unavailable: worth trying the next server
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const USER_AGENT =
  process.env.OVERPASS_USER_AGENT ?? 'AftermathSeniorProject/1.0 (replace with a team contact)';
const SERVER_TIMEOUT_S = 25; // overpass aborts the query after this long
const FETCH_TIMEOUT_MS = 30_000;
const COORD_DECIMALS = 3; // about 100 m; also keeps a person's exact location private
const DEFAULT_RADIUS_M = 10_000;
const MAX_RADIUS_M = 25_000;
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export type ResourceCategory = 'hospital' | 'clinic' | 'pharmacy' | 'shelter' | 'assembly_point';

// OSM tag filter for each category
// add a category here to search for more things
// amenity=shelter is NOT used because in OSM it means bus-stop and picnic shelters
const FILTERS: Record<ResourceCategory, string> = {
  hospital: '["amenity"="hospital"]',
  clinic: '["amenity"="clinic"]',
  pharmacy: '["amenity"="pharmacy"]',
  shelter: '["social_facility"="shelter"]',
  assembly_point: '["emergency"="assembly_point"]',
};

export interface Resource {
  id: string; // ex: "way/123456"
  category: ResourceCategory;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  hasEmergencyCare: boolean; // true only when OSM says emergency=yes
  source: 'OpenStreetMap';
}

export interface FindResourcesOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number; // default 10,000, max 25,000
  categories?: ResourceCategory[]; // default: all
  limit?: number; // default 200, applied after sorting by distance
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number; // nodes
  lon?: number;
  center?: { lat: number; lon: number }; // ways and relations, from "out center"
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string; // overpass reports some failures here, even with HTTP 200
}

// cache

const cache = new Map<string, { at: number; data: Resource[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

function cacheSet(key: string, data: Resource[]) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), data });
}

// searches that are running right now, so identical requests share one Overpass call
const inFlight = new Map<string, Promise<Resource[]>>();

// all Overpass requests go through this queue so only one is ever running at a time
let queue: Promise<unknown> = Promise.resolve();

function runOneAtATime<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task);
  queue = result.catch(() => undefined); // a failed request must not block the ones behind it
  return result;
}

// helper functions!

// great-circle distance in meters (haversine formula)
function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6_371_000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

function categoryOf(tags: Record<string, string>): ResourceCategory | null {
  if (tags.amenity === 'hospital') return 'hospital';
  if (tags.amenity === 'clinic') return 'clinic';
  if (tags.amenity === 'pharmacy') return 'pharmacy';
  if (tags.social_facility === 'shelter') return 'shelter';
  if (tags.emergency === 'assembly_point') return 'assembly_point';
  return null;
}

function formatAddress(tags: Record<string, string>): string | undefined {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const cityLine = [tags['addr:city'], tags['addr:state']].filter(Boolean).join(', ');
  const parts = [street, cityLine, tags['addr:postcode']].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

// builds the Overpass QL query
// only numbers and whitelisted filters go into the text
function buildQuery(
  latitude: number,
  longitude: number,
  radiusMeters: number,
  categories: ResourceCategory[]
): string {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  const parts = categories.map((category) => `nwr${FILTERS[category]}${around};`).join('\n  ');
  return `[out:json][timeout:${SERVER_TIMEOUT_S}];\n(\n  ${parts}\n);\nout tags center;`;
}

// sends the query to each server in ENDPOINTS, one at a time, until one answers
async function runQuery(query: string): Promise<OverpassElement[]> {
  let lastError = new Error('Overpass request failed');

  for (const endpoint of ENDPOINTS) {
    const host = new URL(endpoint).host;

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      // network error or timeout: try the next server
      const reason = err instanceof Error ? err.message : String(err);
      lastError = new Error(`Overpass request to ${host} failed: ${reason}`);
      continue;
    }

    // 429 = rate limited, 500/502/503 = server trouble, 504 = query too slow (try a smaller radius)
    if (RETRYABLE_STATUSES.has(res.status)) {
      lastError = new Error(`Overpass busy or unavailable (${res.status} from ${host})`);
      continue;
    }
    if (!res.ok) {
      // anything else (for example 400) means our query is wrong, so trying another server won't help
      throw new Error(`Overpass request failed: ${res.status} from ${host}`);
    }

    let json: OverpassResponse;
    try {
      json = (await res.json()) as OverpassResponse;
    } catch {
      // HTTP 200 but the body was cut off or not JSON: try the next server
      lastError = new Error(`Overpass sent an unreadable response from ${host}`);
      continue;
    }
    // Overpass can answer 200 but report that the query was aborted partway through.
    if (json.remark?.includes('runtime error')) {
      lastError = new Error(`Overpass aborted the query on ${host}: ${json.remark}`);
      continue;
    }
    return json.elements ?? [];
  }

  throw lastError;
}

// asks Overpass, turns the elements into Resources (nearest first) and caches them
async function fetchResources(
  key: string,
  lat: number,
  lon: number,
  radiusMeters: number,
  requested: ResourceCategory[]
): Promise<Resource[]> {
  const elements = await runOneAtATime(() =>
    runQuery(buildQuery(lat, lon, radiusMeters, requested))
  );

  const resources: Resource[] = [];
  for (const element of elements) {
    const tags = element.tags ?? {};
    const category = categoryOf(tags);
    const elementLat = element.lat ?? element.center?.lat;
    const elementLon = element.lon ?? element.center?.lon;
    if (!category || elementLat === undefined || elementLon === undefined) continue;

    resources.push({
      id: `${element.type}/${element.id}`,
      category,
      name: tags.name ?? tags.operator ?? 'Unnamed facility',
      latitude: elementLat,
      longitude: elementLon,
      distanceMeters: Math.round(distanceMeters(lat, lon, elementLat, elementLon)),
      address: formatAddress(tags),
      phone: tags.phone ?? tags['contact:phone'],
      website: tags.website ?? tags['contact:website'],
      openingHours: tags.opening_hours,
      hasEmergencyCare: tags.emergency === 'yes',
      source: 'OpenStreetMap',
    });
  }

  // sort by distance
  resources.sort((a, b) => a.distanceMeters - b.distanceMeters);

  cacheSet(key, resources);
  return resources;
}

// public API
export async function findResources(options: FindResourcesOptions): Promise<Resource[]> {
  const { latitude, longitude } = options;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error('latitude/longitude out of range');
  }
  if (options.radiusMeters !== undefined && !Number.isFinite(options.radiusMeters)) {
    throw new Error('radiusMeters must be a number');
  }
  if (options.limit !== undefined && !Number.isFinite(options.limit)) {
    throw new Error('limit must be a number');
  }

  const radiusMeters = Math.round(
    Math.min(Math.max(options.radiusMeters ?? DEFAULT_RADIUS_M, 100), MAX_RADIUS_M)
  );
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const requested = [
    ...new Set(options.categories ?? (Object.keys(FILTERS) as ResourceCategory[])),
  ];
  if (requested.length === 0 || requested.some((category) => !Object.hasOwn(FILTERS, category))) {
    throw new Error(`categories must be from: ${Object.keys(FILTERS).join(', ')}`);
  }

  // round the search center: better privacy, and nearby requests share a cache entry
  const lat = Number(latitude.toFixed(COORD_DECIMALS));
  const lon = Number(longitude.toFixed(COORD_DECIMALS));

  const key = `${lat},${lon},${radiusMeters},${[...requested].sort().join('+')}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data.slice(0, limit);
  }

  // if the same search is already running, wait for it instead of sending another request
  let pending = inFlight.get(key);
  if (!pending) {
    pending = fetchResources(key, lat, lon, radiusMeters, requested).finally(() =>
      inFlight.delete(key)
    );
    inFlight.set(key, pending);
  }

  const resources = await pending;
  return resources.slice(0, limit);
}