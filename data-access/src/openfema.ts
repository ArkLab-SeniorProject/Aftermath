const BASE_URL = 'https://www.fema.gov/api/open/v2';

export interface DisasterDeclaration {
  disasterNumber: number;
  declarationTitle: string;
  state: string;
  declarationDate: string;
  incidentType: string;
  designatedArea?: string;
  fipsStateCode?: string;
  fipsCountyCode?: string;
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
    params.push(
      `$filter=${encodeURIComponent(`state eq '${state.toUpperCase()}'`)}`
    );
  }

  const res = await fetch(
    `${BASE_URL}/DisasterDeclarationsSummaries?${params.join('&')}`
  );
  if (!res.ok) throw new Error(`OpenFEMA request failed: ${res.status}`);

  const json = (await res.json()) as OpenFemaResponse;
  console.log(JSON.stringify(json).slice(0, 500)); // TEMPORARY LINE - delete after checking
  return {
    total: json.metadata?.count ?? 0,
    declarations: json.DisasterDeclarationsSummaries ?? [],
  };
}