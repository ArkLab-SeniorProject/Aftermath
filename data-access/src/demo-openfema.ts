/**
 * OpenFEMA demo + test script created by tiff
 *
 * This program basically shows what the OpenFEMA API can do from the terminal!
 * Each demo is numbered and features a different functionality:
 * filtering, field selection, paging, other datasets, CSV export, error handling
 *
 * Example runs from the data-access folder:
 * npx tsx src/demo-openfema.ts                         prints menu
 * npx tsx src/demo-openfema.ts 4 TX                    run demo 4 for Texas
 * npx tsx src/demo-openfema.ts 8 PA 2021               run demo 8 : state and year
 * npx tsx src/demo-openfema.ts peek FimaNfipClaims 2   inspect any dataset
 * npx tsx src/demo-openfema.ts all                     run everything + prints summary
 *
 * This file only calls the public OpenFEMA API and does not touch the database, login code, or .env.local
 */

import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getDisasterDeclarations } from './openfema.js';

// configs
const API = 'https://www.fema.gov/api/open';
const DECLARATIONS = 'DisasterDeclarationsSummaries';
type Row = Record<string, unknown>;
type Params = Record<string, string | number | boolean>;

interface QueryResult {
  rows: Row[]; // the records
  count?: number; // total matching records (only present when $count=true)
  bytes: number; // size of raw response
}

interface Disaster {
  number: number;
  date: string;
  type: string;
  title: string;
  areas: number; // how many county rows this disaster had
}

interface RunResult {
  demo: string;
  status: 'ok' | 'FAILED';
  seconds: string;
}

// helper functions

// builds a full OpenFEMA URL - values are URL-encoded
function buildUrl(dataset: string, params: Params, version = 'v2'): string {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${API}/${version}/${dataset}?${queryString}`;
}

// calls an OpenFEMA dataset and returns its records
async function query(dataset: string, params: Params, version = 'v2'): Promise<QueryResult> {
  const url = buildUrl(dataset, params, version);

  // print the request so we can see the raw API call
  console.log(`  GET ${decodeURIComponent(url)}\n`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenFEMA returned HTTP ${res.status}`);
  }

  const text = await res.text();
  const json = JSON.parse(text) as { metadata?: { count?: number } } & Record<string, unknown>;

  return {
    rows: (json[dataset] as Row[] | undefined) ?? [],
    count: json.metadata?.count,
    bytes: Buffer.byteLength(text),
  };
}

// fixes formatting of dates, money, and error messages for console output
const day = (value: unknown) => String(value).slice(0, 10);
const money = (value: unknown) => `$${Number(value ?? 0).toLocaleString('en-US')}`;
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

// validates a 2 letter state code (liek PA)
function validState(input: string | undefined, fallback = 'PA'): string {
  const state = (input ?? fallback).toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) {
    throw new Error(`"${input}" is not a 2-letter state code`);
  }
  return state;
}

// OpenFEMA returns one row per disaster PER COUNTY, so the same disasterNumber repeats many times
// because of this, we can group the rows so each disaster appears once
function groupByDisaster(rows: Row[]): Disaster[] {
  const byNumber = new Map<number, Disaster>();
  for (const r of rows) {
    const number = Number(r.disasterNumber);
    const existing = byNumber.get(number);
    if (existing) {
      existing.areas += 1;
    } else {
      byNumber.set(number, {
        number,
        date: day(r.declarationDate),
        type: String(r.incidentType),
        title: String(r.declarationTitle),
        areas: 1,
      });
    }
  }
  return [...byNumber.values()];
}

const disasterTable = (disasters: Disaster[]) =>
  disasters.map((d) => ({
    disasterNumber: d.number,
    declared: d.date,
    type: d.type,
    title: d.title,
    areas: d.areas,
  }));

// demo functions!

// Demo 1: live data with no API key
async function latestNationwide() {
  const { rows, count } = await query(DECLARATIONS, {
    $top: 5,
    $orderby: 'declarationDate desc',
    $count: true,
  });
  console.log(`Declaration records in OpenFEMA right now: ${count?.toLocaleString()}`);
  console.table(
    rows.map((r) => ({
      declared: day(r.declarationDate),
      state: r.state,
      type: r.incidentType,
      title: r.declarationTitle,
      area: r.designatedArea,
    }))
  );
}

// Demo 2: our own openfema.ts function, then group by disaster
async function stateSummary(stateArg?: string) {
  const state = validState(stateArg);
  const { total, declarations } = await getDisasterDeclarations({ state, limit: 100 });

  // Spread each record into a plain object so it matches the generic Row type.
  const disasters = groupByDisaster(declarations.map((d) => ({ ...d })));

  console.log(`Using our own getDisasterDeclarations() service for ${state}.`);
  console.log(
    `${total.toLocaleString()} county-level records exist; showing the newest ${declarations.length}, grouped into ${disasters.length} disasters:\n`
  );
  console.table(disasterTable(disasters));
}

// Demo 3: select returns only the fields we ask for
async function selectDemo(stateArg?: string) {
  const state = validState(stateArg);
  const filter = `state eq '${state}'`;

  const full = await query(DECLARATIONS, { $top: 100, $filter: filter });
  const slim = await query(DECLARATIONS, {
    $top: 100,
    $filter: filter,
    $select: 'disasterNumber,declarationTitle,declarationDate,incidentType,designatedArea',
  });

  const saved = Math.round((1 - slim.bytes / full.bytes) * 100);
  console.table([
    { request: 'all fields', records: full.rows.length, kilobytes: (full.bytes / 1024).toFixed(1) },
    {
      request: '$select, 5 fields',
      records: slim.rows.length,
      kilobytes: (slim.bytes / 1024).toFixed(1),
    },
  ]);
  console.log(`Asking only for the fields we need made the response about ${saved}% smaller.`);
}

// Demo 4: combined filters
async function hurricanesSince(stateArg?: string) {
  const state = validState(stateArg, 'FL');
  const filter = `state eq '${state}' and startswith(declarationTitle,'HURRICANE') and declarationDate gt '2015-01-01T00:00:00.000z'`;

  const { rows } = await query(DECLARATIONS, {
    $filter: filter,
    $top: 1000,
    $orderby: 'declarationDate desc',
  });

  const disasters = groupByDisaster(rows);
  if (disasters.length === 0) {
    console.log(`No hurricane declarations for ${state} since 2015. Try FL, TX, LA or NC.`);
    return;
  }
  console.log(
    `${disasters.length} hurricane disasters declared in ${state} since 2015 (${rows.length} county rows):\n`
  );
  console.table(disasterTable(disasters));
}

// Demo 5: which disasters unlocked FEMA Individual Assistance? (household aid)
async function individualAssistance(stateArg?: string) {
  const state = validState(stateArg, 'TX');
  const base = `state eq '${state}'`;
  let rows: Row[];

  try {
    ({ rows } = await query(DECLARATIONS, {
      $filter: `${base} and iaProgramDeclared eq true`,
      $top: 1000,
      $orderby: 'declarationDate desc',
    }));
    console.log('Filtered on the server with: iaProgramDeclared eq true\n');
  } catch {
    console.log('Server-side boolean filter was rejected, so filtering locally instead.\n');
    ({ rows } = await query(DECLARATIONS, {
      $filter: base,
      $top: 1000,
      $orderby: 'declarationDate desc',
    }));
    rows = rows.filter((r) => r.iaProgramDeclared === true);
  }

  const disasters = groupByDisaster(rows);
  console.log(
    `${state}: ${disasters.length} disasters where FEMA Individual Assistance (aid for households) was declared. Newest 10:\n`
  );
  console.table(disasterTable(disasters.slice(0, 10)));
}

// Demo 6: paging with page size and how many records to skip
async function paging(stateArg?: string) {
  const state = validState(stateArg);
  const pageSize = 5;

  for (const page of [1, 2]) {
    const skip = (page - 1) * pageSize;
    const { rows, count } = await query(DECLARATIONS, {
      $filter: `state eq '${state}'`,
      $top: pageSize,
      $skip: skip,
      $orderby: 'declarationDate desc',
      $count: true,
    });
    const pages = Math.ceil((count ?? 0) / pageSize);
    console.log(`Page ${page} ($top=${pageSize}, $skip=${skip}) of about ${pages} pages`);
    console.table(
      rows.map((r) => ({
        disasterNumber: r.disasterNumber,
        declared: day(r.declarationDate),
        area: r.designatedArea,
      }))
    );
  }
}

// Demo 7: client-side analysis - counts distinct disasters by type and draws a text bar chart
// at this point, im starting to crash out oml GAHHHHH
async function incidentTypes(stateArg?: string) {
  const state = validState(stateArg);

  // only two fields are needed
  const { rows } = await query(DECLARATIONS, {
    $filter: `state eq '${state}' and declarationDate gt '2010-01-01T00:00:00.000z'`,
    $top: 5000,
    $select: 'disasterNumber,incidentType',
  });

  // count each disaster once since rows repeat per county
  const seen = new Set<number>();
  const counts = new Map<string, number>();
  for (const r of rows) {
    const number = Number(r.disasterNumber);
    if (seen.has(number)) continue;
    seen.add(number);
    const type = String(r.incidentType);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  console.log(
    `Federally declared disasters in ${state} since 2010, by type (${seen.size} total):\n`
  );
  for (const [type, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${type.padEnd(24)} ${'█'.repeat(n)} ${n}`);
  }
}

//Demo 8: a different dataset! NFIP flood insurance claims
async function floodClaims(stateArg?: string, yearArg?: string) {
  const state = validState(stateArg);
  const year = Number(yearArg ?? 2021);
  if (!Number.isInteger(year)) {
    throw new Error('year must be a number, e.g. 2021');
  }

  const { rows, count } = await query('FimaNfipClaims', {
    $filter: `state eq '${state}' and yearOfLoss eq ${year}`,
    $top: 5,
    $count: true,
    $orderby: 'amountPaidOnBuildingClaim desc',
    $select: 'dateOfLoss,ratedFloodZone,amountPaidOnBuildingClaim,amountPaidOnContentsClaim',
  });

  console.log(
    `NFIP flood insurance claims in ${state} with a ${year} loss date: ${count?.toLocaleString()}`
  );
  console.log('Five largest building payouts:\n');
  console.table(
    rows.map((r) => ({
      dateOfLoss: day(r.dateOfLoss),
      floodZone: r.ratedFloodZone,
      building: money(r.amountPaidOnBuildingClaim),
      contents: money(r.amountPaidOnContentsClaim),
    }))
  );
}

// Demo 9: the `peek` command - look inside any dataset
// we can use this to discover what datsets contain before writing an actual query
async function peek(dataset?: string, countArg?: string) {
  // Dataset names are letters only; checking keeps odd input out of the URL path.
  if (!dataset || !/^[A-Za-z]+$/.test(dataset)) {
    throw new Error('usage: peek <DatasetName> [rows]');
  }
  const n = Math.min(Number(countArg ?? 3) || 3, 10);

  const { rows, count } = await query(dataset, { $top: n, $count: true });
  const fields = Object.keys(rows[0] ?? {});

  console.log(`${dataset}: ${count?.toLocaleString() ?? '?'} total records`);
  console.log(`Fields (${fields.length}): ${fields.join(', ')}\n`);
  console.log('First record:');
  console.log(JSON.stringify(rows[0], null, 2));
}

// Demo 10: OpenFEMA describes its own datasets through a v1 metadata endpoint (whatever that means...)
async function catalog() {
  const { rows, count } = await query(
    'DataSets',
    { $select: 'identifier,name', $orderby: 'name', $top: 15, $count: true },
    'v1'
  );
  console.log(`OpenFEMA's own catalog lists ${count} datasets. First 15 by name:\n`);
  console.table(rows);
}

// Demo 11: same API; saved to a temp file you can open in Excel
async function csvExport(stateArg?: string) {
  const state = validState(stateArg);
  const url = buildUrl(DECLARATIONS, {
    $format: 'csv',
    $top: 100,
    $filter: `state eq '${state}'`,
    $orderby: 'declarationDate desc',
    $select:
      'disasterNumber,declarationDate,incidentType,declarationTitle,designatedArea,fipsStateCode,fipsCountyCode',
  });
  console.log(`  GET ${decodeURIComponent(url)}\n`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenFEMA returned HTTP ${res.status}`);
  }
  const csv = await res.text();
  const file = join(tmpdir(), `openfema-${state}-declarations.csv`);
  writeFileSync(file, csv);
  const lines = csv.split('\n').filter(Boolean);
  console.log(`Saved ${lines.length - 1} records to ${file}`);
  console.log(`Open it on a Mac with:  open ${file}\n`);
  console.log(lines.slice(0, 4).join('\n')); // header and first 3 records
}

// Demo 12: two kinds of errors, one caught by our code and one rejected by FEMA
async function errorHandling() {
  // case 1: our validation rejects the input before any request is sent
  try {
    await getDisasterDeclarations({ state: 'Pennsylvania' });
    console.log('1. Unexpected: the full state name was accepted.');
  } catch (err) {
    console.log(`1. Our service validation caught it: ${message(err)}`);
  }

  // case 2: a bad filter reaches FEMA's strict parser
  try {
    await query(DECLARATIONS, { $filter: "state = 'PA'", $top: 1 });
    console.log('2. FEMA unexpectedly accepted the malformed filter.');
  } catch (err) {
    console.log(`2. FEMA rejected a malformed filter (it needs "eq"): ${message(err)}`);
  }
}

// menu
interface Demo {
  title: string;
  run: (a?: string, b?: string) => Promise<void>; // a = state, b = year (where used)
}

// for the below code, I used AI to generate the menu
const demos: Record<string, Demo> = {
  '1': {
    title: 'Live data, no API key: newest declarations nationwide',
    run: () => latestNationwide(),
  },
  '2': { title: 'Our service: one state, grouped by disaster', run: (a) => stateSummary(a) },
  '3': { title: '$select: ask only for the fields you need', run: (a) => selectDemo(a) },
  '4': {
    title: 'Combined filters: hurricanes in a state since 2015',
    run: (a) => hurricanesSince(a),
  },
  '5': {
    title: 'Household aid: disasters with Individual Assistance',
    run: (a) => individualAssistance(a),
  },
  '6': { title: 'Paging with $top and $skip', run: (a) => paging(a) },
  '7': { title: 'Analysis: disasters by type since 2010', run: (a) => incidentTypes(a) },
  '8': { title: 'Insurance data: NFIP flood claims', run: (a, b) => floodClaims(a, b) },
  '9': {
    title: 'ZIP-level data: housing assistance for homeowners',
    run: () => peek('HousingAssistanceOwners', '3'),
  },
  '10': { title: "Discovery: OpenFEMA's dataset catalog", run: () => catalog() },
  '11': { title: 'Export to CSV', run: (a) => csvExport(a) },
  '12': { title: 'Error handling', run: () => errorHandling() },
};

function usage() {
  console.log('Usage: npx tsx src/demo-openfema.ts <demo> [state] [year]\n');
  for (const [id, demo] of Object.entries(demos)) {
    console.log(`  ${id.padEnd(3)} ${demo.title}`);
  }
  console.log('  all  run every demo with default settings and print a summary');
  console.log('  peek <DatasetName> [rows]  inspect any OpenFEMA dataset\n');
}

async function main() {
  const [command, arg1, arg2] = process.argv.slice(2);

  if (command === 'peek') {
    await peek(arg1, arg2);
    return;
  }
  if (!command || (command !== 'all' && !(command in demos))) {
    usage();
    return;
  }

  const ids = command === 'all' ? Object.keys(demos) : [command];
  const results: RunResult[] = [];

  for (const id of ids) {
    const demo = demos[id];
    if (!demo) continue;

    console.log(`\n${'='.repeat(72)}\nDemo ${id}: ${demo.title}\n${'='.repeat(72)}`);

    const started = Date.now();
    let status: RunResult['status'] = 'ok';
    try {
      await demo.run(arg1, arg2);
    } catch (err) {
      // one failing demo should not stop the rest of the entire run
      status = 'FAILED';
      process.exitCode = 1;
      console.error(`Demo ${id} failed: ${message(err)}`);
    }
    results.push({
      demo: `${id}. ${demo.title}`,
      status,
      seconds: ((Date.now() - started) / 1000).toFixed(1),
    });
  }

  // finish with a pass/fail table
  if (results.length > 1) {
    console.log('\nSummary');
    console.table(results);
  }
}

main().catch((err) => {
  console.error(message(err));
  process.exit(1);
});
