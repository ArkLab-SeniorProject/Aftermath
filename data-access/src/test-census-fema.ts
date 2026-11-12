// test file for Census Geocoder and OpenFEMA APIs

// Run from the repo root:
// npx tsx data-access/src/test-census-fema.ts
// npx tsx data-access/src/test-census-fema.ts "your full street address, city, state ZIP"

import { geocodeAddress } from './census-geocoder.js';

const address = process.argv[2] ?? '1400 John F Kennedy Blvd, Philadelphia, PA 19107';

// 1. address -> coordinates + county codes
const place = await geocodeAddress(address);
if (!place?.stateFips || !place.countyFips) {
  console.log(
    'Could not find a county for that address. Include a street, city, and state or ZIP.'
  );
  process.exit(1);
}
console.log(
  `${place.matchedAddress} -> ${place.countyName} (state ${place.stateFips}, county ${place.countyFips})\n`
);

// 2. ask OpenFEMA for that county's declarations
// FEMA stores the codes as strings, so they are quoted in the filter
const filter = `fipsStateCode eq '${place.stateFips}' and fipsCountyCode eq '${place.countyFips}'`;
const select =
  'disasterNumber,declarationTitle,declarationDate,incidentType,iaProgramDeclared,ihProgramDeclared';
const url = `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=${encodeURIComponent(filter)}&$orderby=declarationDate%20desc&$top=10&$select=${encodeURIComponent(select)}`;

const res = await fetch(url);
if (!res.ok) {
  throw new Error(`OpenFEMA request failed: ${res.status}`);
}
const json = (await res.json()) as { DisasterDeclarationsSummaries?: Record<string, unknown>[] };

// 3. show the 10 most recent declarations
console.table(json.DisasterDeclarationsSummaries ?? []);
