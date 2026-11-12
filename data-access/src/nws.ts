// National Weather Service (api.weather.gov) API

// - getActiveAlerts(): alerts active at a coordinate
// - getActiveAlertsForState(): alerts active anywhere in a state
// - getForecast(): c7-day forecast periods for a coordinate

// no API key needed
// NWS asks every client to send a User-Agent that names the app and gives a contact
// set NWS_USER_AGENT in the environment

// coordinates are rounded before being sent
// weather grids are about 2.5 km wide, so extra precision adds nothing
// sending less of a person's location is better.

const BASE_URL = 'https://api.weather.gov';
const USER_AGENT =
  process.env.NWS_USER_AGENT ?? 'AftermathSeniorProject/1.0 (replace with a team contact)';
const TIMEOUT_MS = 10_000;
const COORD_DECIMALS = 3;

export interface WeatherAlert {
  id?: string;
  event: string; // ex: "Flood Warning"
  severity: string; // Extreme | Severe | Moderate | Minor | Unknown
  urgency: string; // Immediate | Expected | Future | Past | Unknown
  certainty: string;
  headline: string | null;
  description: string | null;
  instruction: string | null; // what people should do
  areaDesc: string;
  effective: string;
  expires: string;
  senderName: string;
}

export interface ForecastPeriod {
  name: string; // "Tonight", "Thursday", etc
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  precipChance: number | null; // percent; or null when NWS gives none
  windSpeed: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface Forecast {
  city?: string;
  state?: string;
  office?: string; // NWS forecast office id
  periods: ForecastPeriod[];
}

interface AlertsResponse {
  features?: Array<{ properties: WeatherAlert }>;
}

interface PointsResponse {
  properties?: {
    gridId?: string;
    forecast?: string;
    relativeLocation?: { properties?: { city?: string; state?: string } };
  };
}

interface ForecastResponse {
  properties?: {
    periods?: Array<{
      name: string;
      isDaytime: boolean;
      temperature: number;
      temperatureUnit: string;
      probabilityOfPrecipitation?: { value: number | null };
      windSpeed: string;
      shortForecast: string;
      detailedForecast: string;
    }>;
  };
}

// most severe first, so the UI can show more important ones at the top
const SEVERITY_ORDER = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown'];
const severityRank = (severity: string) => {
  const index = SEVERITY_ORDER.indexOf(severity);
  return index === -1 ? SEVERITY_ORDER.length : index;
};

// GETs JSON from NWS
// returns null on 404 (for example: a point outside U.S. coverage)
async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`NWS request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

function roundedPoint(latitude: number, longitude: number): string {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error('latitude/longitude out of range');
  }
  return `${latitude.toFixed(COORD_DECIMALS)},${longitude.toFixed(COORD_DECIMALS)}`;
}

function toAlerts(json: AlertsResponse | null): WeatherAlert[] {
  const alerts = (json?.features ?? []).map((feature) => feature.properties);
  return alerts.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

// alerts active right now at a coordinate
// an empty array means none; this is normal
export async function getActiveAlerts(
  latitude: number,
  longitude: number
): Promise<WeatherAlert[]> {
  const point = roundedPoint(latitude, longitude);
  return toAlerts(await getJson<AlertsResponse>(`${BASE_URL}/alerts/active?point=${point}`));
}

// alerts active anywhere in a state
// takes 2-letter code such as "PA"
export async function getActiveAlertsForState(state: string): Promise<WeatherAlert[]> {
  const code = state.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new Error('state must be a 2-letter code');
  }
  return toAlerts(await getJson<AlertsResponse>(`${BASE_URL}/alerts/active?area=${code}`));
}

// 7-day forecast for a coordinate
// returns null when NWS has no data for the point
export async function getForecast(latitude: number, longitude: number): Promise<Forecast | null> {
  const point = roundedPoint(latitude, longitude);

  // first call: resolve the coordinate to a grid cell and a forecast URL
  const points = await getJson<PointsResponse>(`${BASE_URL}/points/${point}`);
  const forecastUrl = points?.properties?.forecast;
  if (!forecastUrl) return null;

  // only follow the URL if it really points at NWS
  if (!forecastUrl.startsWith(`${BASE_URL}/`)) {
    throw new Error('Unexpected forecast URL from NWS');
  }

  // second call: fetch the forecast itself
  const forecast = await getJson<ForecastResponse>(forecastUrl);
  const periods = forecast?.properties?.periods ?? [];

  const place = points?.properties?.relativeLocation?.properties;
  return {
    city: place?.city,
    state: place?.state,
    office: points?.properties?.gridId,
    periods: periods.map((p) => ({
      name: p.name,
      isDaytime: p.isDaytime,
      temperature: p.temperature,
      temperatureUnit: p.temperatureUnit,
      precipChance: p.probabilityOfPrecipitation?.value ?? null,
      windSpeed: p.windSpeed,
      shortForecast: p.shortForecast,
      detailedForecast: p.detailedForecast,
    })),
  };
}
