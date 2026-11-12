// Socrata discovery script
// this searches Socrata catalog (all participating city/county/state/federal portals)
// for datasets that could help disaster survivors, then summarizes which portals publish them

// Purpose: decide which cities to pilot, based on data and not guesses.

// how to use this:
// - npx tsx data-access/src/socrata-discovery.ts = default keyword list
// - npx tsx data-access/src/socrata-discovery.ts "boil water" = your own keywords
// - npx tsx data-access/src/socrata-discovery.ts --raw = print one raw result

// No API key needed for catalog searched
// SOCRATA_APP_TOKEN is optional
// Note: some cities do NOT use Socrata, so this will not find everything

import { writeFile } from 'node:fs/promises';

const CATALOG_URL = 'https://api.us.socrata.com/api/catalog/v1';

// what we search for - each one maps to a survivor need
const KEYWORDS = [
  'emergency shelter',
  'warming center',
  'cooling center',
  'food pantry',
  'hospital',
  'evacuation zone',
  'storm debris',
  'flood',
  'disaster',
  'community resources',
];

const RESULTS_PER_KEYWORD = 100;
const RECENT_DAYS = 365; // "recent" = updated within the last year
const REQUEST_TIMEOUT_MS = 15000;
const DELAY_BETWEEN_REQUESTS_MS = 300;

// column names that suggest the dataset can be placed on a map
const LOCATION_COLUMN_PATTERN = /lat|lon|lng|location|address|geo|point|coord/i;

// shape of the catalog response
// everything is optional because Socrata is inconsistent and some portals are misconfigured
type CatalogResult = {
  resource?: {
    name?: string;
    id?: string;
    type?: string;
    updatedAt?: string;
    columns_field_name?: string[];
  };
  metadata?: { domain?: string };
  permalink?: string;
};

type CatalogResponse = {
  results?: CatalogResult[];
  resultSetSize?: number;
};

type DatasetHit = {
  domain: string;
  id: string;
  name: string;
  updatedAt: string | null;
  recent: boolean;
  hasLocation: boolean;
  keywords: Set<string>;
  url: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCatalog(keyword: string): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    q: keyword,
    only: 'datasets',
    limit: String(RESULTS_PER_KEYWORD),
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.SOCRATA_APP_TOKEN) {
    headers['X-App-Token'] = process.env.SOCRATA_APP_TOKEN;
  }

  const response = await fetch(`${CATALOG_URL}?${params.toString()}`, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Catalog search for "${keyword}" failed: HTTP ${response.status}`);
  }

  return (await response.json()) as CatalogResponse;
}

function isRecent(updatedAt: string | undefined): boolean {
  if (!updatedAt) return false;
  const time = Date.parse(updatedAt);
  if (Number.isNaN(time)) return false;
  return time >= Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
}

async function main() {
  const args = process.argv.slice(2);
  const raw = args.includes('--raw');
  const custom = args.filter((arg) => arg !== '--raw');
  const keywords = custom.length > 0 ? custom : KEYWORDS;

  // --raw: show one untouched result so we can confirm field names
  if (raw) {
    const data = await searchCatalog(keywords[0] ?? 'emergency shelter');
    console.log(`resultSetSize: ${data.resultSetSize}`);
    console.log(JSON.stringify(data.results?.[0], null, 2));
    return;
  }

  const hits = new Map<string, DatasetHit>();
  const perKeyword: { keyword: string; inCatalog: number; fetched: number }[] = [];

  for (const keyword of keywords) {
    console.log(`Searching: "${keyword}"...`);
    try {
      const data = await searchCatalog(keyword);
      const results = data.results ?? [];
      perKeyword.push({
        keyword,
        inCatalog: data.resultSetSize ?? 0,
        fetched: results.length,
      });

      for (const result of results) {
        const domain = result.metadata?.domain;
        const id = result.resource?.id;
        if (!domain || !id) continue;

        const key = `${domain}/${id}`;
        const existing = hits.get(key);
        if (existing) {
          existing.keywords.add(keyword);
          continue;
        }

        const columns = result.resource?.columns_field_name ?? [];
        hits.set(key, {
          domain,
          id,
          name: result.resource?.name ?? '(unnamed)',
          updatedAt: result.resource?.updatedAt ?? null,
          recent: isRecent(result.resource?.updatedAt),
          hasLocation: columns.some((column) => LOCATION_COLUMN_PATTERN.test(column)),
          keywords: new Set([keyword]),
          url: result.permalink ?? `https://${domain}/d/${id}`,
        });
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.log(`  skipped: ${reason}`);
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  const all = [...hits.values()];

  // 1. per-keyword totals
  console.log('\n=== Datasets per keyword (whole catalog vs fetched) ===');
  console.table(perKeyword);

  // 2. portals ranked by how much useful data they publish
  const byDomain = new Map<
    string,
    {
      domain: string;
      datasets: number;
      recent: number;
      mappable: number;
      usable: number;
      needs: Set<string>;
    }
  >();
  for (const hit of all) {
    const row = byDomain.get(hit.domain) ?? {
      domain: hit.domain,
      datasets: 0,
      recent: 0,
      mappable: 0,
      usable: 0,
      needs: new Set<string>(),
    };
    row.datasets += 1;
    if (hit.recent) row.recent += 1;
    if (hit.hasLocation) row.mappable += 1;
    if (hit.recent && hit.hasLocation) {
      row.usable += 1;
      for (const keyword of hit.keywords) row.needs.add(keyword);
    }
    byDomain.set(hit.domain, row);
  }

  const ranked = [...byDomain.values()]
    .sort((a, b) => b.usable - a.usable || b.datasets - a.datasets)
    .slice(0, 30)
    .map((row) => ({
      domain: row.domain,
      datasets: row.datasets,
      updatedLastYear: row.recent,
      hasLocationCols: row.mappable,
      usable: row.usable, // recent AND mappable
      distinctNeedsCovered: row.needs.size,
    }));

  console.log('\n=== Top portals (usable = updated in last year + has location columns) ===');
  console.table(ranked);

  // 3. best individual datasets
  const best = all
    .filter((hit) => hit.recent && hit.hasLocation)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, 40)
    .map((hit) => ({
      domain: hit.domain,
      id: hit.id,
      name: hit.name.slice(0, 60),
      updated: hit.updatedAt?.slice(0, 10),
      matched: [...hit.keywords].join(', '),
    }));

  console.log('\n=== Candidate datasets (recent + mappable) ===');
  console.table(best);

  console.log(`\nTotals: ${all.length} unique datasets across ${byDomain.size} portals.`);

  // save everything for building the registry later
  const outputUrl = new URL('../socrata-discovery-results.json', import.meta.url);
  await writeFile(
    outputUrl,
    JSON.stringify(
      all.map((hit) => ({ ...hit, keywords: [...hit.keywords] })),
      null,
      2
    )
  );
  console.log('Full results saved to data-access/socrata-discovery-results.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
