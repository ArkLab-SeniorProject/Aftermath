// test file for nws api

import { geocodeAddress } from './census-geocoder.js';
import { getActiveAlerts, getActiveAlertsForState, getForecast } from './nws.js';

const address = process.argv[2] ?? '1400 John F Kennedy Blvd, Philadelphia, PA 19107';
const state = process.argv[3] ?? 'PA';

// address -> coordinates (Census Geocoder)
const place = await geocodeAddress(address);
if (!place) {
  console.log('Address not found. Include a street, city, and state or ZIP.');
  process.exit(1);
}
console.log(`${place.matchedAddress} (${place.latitude}, ${place.longitude})\n`);

console.log('--- 7-day forecast ---');
const forecast = await getForecast(place.latitude, place.longitude);
if (!forecast) {
  console.log('No forecast available for this point.');
} else {
  console.log(`${forecast.city}, ${forecast.state} (NWS office ${forecast.office})`);
  console.table(
    forecast.periods.slice(0, 6).map((p) => ({
      period: p.name,
      temp: `${p.temperature}°${p.temperatureUnit}`,
      rain: p.precipChance === null ? 'n/a' : `${p.precipChance}%`,
      summary: p.shortForecast,
    }))
  );
}

console.log('\n--- active alerts at this location ---');
const here = await getActiveAlerts(place.latitude, place.longitude);
if (here.length === 0) {
  console.log('None right now (this is normal).');
} else {
  console.table(
    here.map((a) => ({
      event: a.event,
      severity: a.severity,
      urgency: a.urgency,
      expires: a.expires,
    }))
  );
}

console.log(`\n--- active alerts anywhere in ${state.toUpperCase()} ---`);
const statewide = await getActiveAlertsForState(state);
console.log(`${statewide.length} active alerts.`);
console.table(
  statewide
    .slice(0, 5)
    .map((a) => ({ event: a.event, severity: a.severity, area: a.areaDesc.slice(0, 50) }))
);

if (statewide[0]) {
  console.log('\nMost severe alert, in full:');
  console.log(statewide[0].headline);
  console.log(statewide[0].instruction ?? '(no instructions given)');
}
