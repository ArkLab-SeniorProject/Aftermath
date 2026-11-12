const BASE_URL = 'https://www.fema.gov/api/open/v2';

export interface DisasterDeclaration {
  id?: string;
  femaDeclarationString?: string;
  disasterNumber: number;
  state: string;
  declarationType?: string;
  declarationDate: string;
  fyDeclared?: number;
  incidentType: string;
  declarationTitle: string;
  ihProgramDeclared?: boolean;
  iaProgramDeclared?: boolean;
  paProgramDeclared?: boolean;
  hmProgramDeclared?: boolean;
  incidentBeginDate?: string;
  incidentEndDate?: string;
  fipsStateCode?: string;
  fipsCountyCode?: string;
  designatedArea?: string;
  region?: number;
}

interface DeclarationsArgs {
  state?: string;
  limit?: number;
  offset?: number;
}

interface OpenFemaResponse {
  metadata?: { count?: number };
  DisasterDeclarationsSummaries?: DisasterDeclaration[];
}

export async function getDisasterDeclarations({
  state,
  limit = 25,
  offset = 0,
}: DeclarationsArgs = {}) {
  const params = [
    `$top=${Math.min(limit, 100)}`,
    `$skip=${offset}`,
    '$count=true',
    `$orderby=${encodeURIComponent('declarationDate desc')}`,
  ];

  if (state) {
    if (!/^[A-Za-z]{2}$/.test(state)) {
      throw new Error('state must be a 2-letter code');
    }
    params.push(`$filter=${encodeURIComponent(`state eq '${state.toUpperCase()}'`)}`);
  }

  const res = await fetch(`${BASE_URL}/DisasterDeclarationsSummaries?${params.join('&')}`);
  if (!res.ok) throw new Error(`OpenFEMA request failed: ${res.status}`);

  const json = (await res.json()) as OpenFemaResponse;
  console.log(JSON.stringify(json).slice(0, 500));
  return {
    total: json.metadata?.count ?? 0,
    declarations: json.DisasterDeclarationsSummaries ?? [],
  };
}

// ── Disasters for one county (used by the recovery quiz) ──

// quiz timeline answer -> incident date window. "to" is exclusive
export type QuizTimeline = 'lt6months' | '6to12months' | '1to3years' | 'gt3years' | 'unsure';

function monthsAgo(months: number, from = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d;
}

export function timelineToWindow(timeline?: string | null): { from: Date; to?: Date } {
  const now = new Date();
  switch (timeline) {
    case 'lt6months':
      return { from: monthsAgo(7, now) }; // 1-month buffer for rough estimates
    case '6to12months':
      return { from: monthsAgo(13, now), to: monthsAgo(5, now) };
    case '1to3years':
      return { from: monthsAgo(37, now), to: monthsAgo(11, now) };
    case 'gt3years':
      return { from: monthsAgo(120, now), to: monthsAgo(35, now) };
    default:
      return { from: monthsAgo(60, now) }; // "unsure": last 5 years
  }
}

export interface CountyDisaster {
  id: string; // femaDeclarationString, ex: "DR-4883-PA"
  disasterNumber: number;
  title: string;
  incidentType: string;
  declarationType?: string;
  incidentBeginDate?: string;
  declarationDate: string;
  iaProgramDeclared: boolean; // Individual Assistance available
}

interface CountyDisasterArgs {
  stateFips: string;
  countyFips: string;
  timeline?: string | null;
}

// declarations covering a county (plus statewide ones, county code "000"), newest first,
// one row per disaster
export async function getDisastersForCounty({
  stateFips,
  countyFips,
  timeline,
}: CountyDisasterArgs): Promise<CountyDisaster[]> {
  if (!/^\d{2}$/.test(stateFips) || !/^\d{3}$/.test(countyFips)) {
    throw new Error('stateFips must be 2 digits and countyFips must be 3 digits');
  }

  const { from, to } = timelineToWindow(timeline);
  const clauses = [
    `fipsStateCode eq '${stateFips}'`,
    `(fipsCountyCode eq '${countyFips}' or fipsCountyCode eq '000')`,
    `incidentBeginDate ge '${from.toISOString()}'`,
  ];
  if (to) clauses.push(`incidentBeginDate lt '${to.toISOString()}'`);

  const select = [
    'femaDeclarationString',
    'disasterNumber',
    'declarationTitle',
    'incidentType',
    'declarationType',
    'incidentBeginDate',
    'declarationDate',
    'iaProgramDeclared',
    'ihProgramDeclared',
  ].join(',');

  const params = [
    `$filter=${encodeURIComponent(clauses.join(' and '))}`,
    `$select=${select}`,
    `$orderby=${encodeURIComponent('incidentBeginDate desc')}`,
    '$top=100',
  ];

  const res = await fetch(`${BASE_URL}/DisasterDeclarationsSummaries?${params.join('&')}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`OpenFEMA request failed: ${res.status}`);

  const json = (await res.json()) as OpenFemaResponse;
  const seen = new Set<number>();
  const disasters: CountyDisaster[] = [];
  for (const row of json.DisasterDeclarationsSummaries ?? []) {
    if (seen.has(row.disasterNumber)) continue;
    seen.add(row.disasterNumber);
    disasters.push({
      id: row.femaDeclarationString ?? `DR-${row.disasterNumber}`,
      disasterNumber: row.disasterNumber,
      title: row.declarationTitle,
      incidentType: row.incidentType,
      declarationType: row.declarationType,
      incidentBeginDate: row.incidentBeginDate,
      declarationDate: row.declarationDate,
      iaProgramDeclared: !!(row.iaProgramDeclared || row.ihProgramDeclared),
    });
  }
  return disasters;
}
