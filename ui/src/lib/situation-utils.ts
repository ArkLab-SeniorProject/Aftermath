import type { RecoveryQuizAnswers } from '../pages/recovery/quiz';

export function quizAnswersToInput(answers: RecoveryQuizAnswers) {
  const loc = answers.location;
  return {
    location: loc
      ? {
          zip: loc.zip ?? answers.zipCode,
          city: loc.city ?? null,
          stateCode: loc.stateCode ?? null,
          countryCode: 'US',
          stateFips: loc.stateFips ?? null,
          countyFips: loc.countyFips ?? null,
          countyName: loc.countyName ?? null,
          latitude: loc.latitude,
          longitude: loc.longitude,
          precision: loc.precision,
        }
      : { zip: answers.zipCode },
    timeline: answers.timeline,
    disasters: answers.disasters.join(','),
    displayName: answers.name || null,
    helpTypes: {
      housing: answers.helpTypes.includes('housing_shelter'),
      financial: answers.helpTypes.includes('financial_assistance'),
      damage: answers.helpTypes.includes('damage_recovery'),
    },
    homeStatus: answers.homeStatus,
    household: answers.household,
  };
}

export function situationToQuizAnswers(record: {
  location?: {
    zip?: string | null;
    city?: string | null;
    stateCode?: string | null;
    stateFips?: string | null;
    countyFips?: string | null;
    countyName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    precision?: string | null;
  } | null;
  timeline?: string | null;
  disasters?: string | null;
  displayName?: string | null;
  helpTypes?: {
    housing?: boolean | null;
    financial?: boolean | null;
    damage?: boolean | null;
  } | null;
  homeStatus?: string | null;
  household?: string[] | null;
}): RecoveryQuizAnswers {
  const helpTypes: string[] = [];
  if (record.helpTypes?.damage) helpTypes.push('damage_recovery');
  if (record.helpTypes?.financial) helpTypes.push('financial_assistance');
  if (record.helpTypes?.housing) helpTypes.push('housing_shelter');

  const disasters = record.disasters
    ? record.disasters
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const loc = record.location;
  const lat = loc?.latitude;
  const lon = loc?.longitude;

  return {
    zipCode: loc?.zip ?? '',
    location:
      loc && typeof lat === 'number' && typeof lon === 'number'
        ? {
            zip: loc.zip ?? null,
            city: loc.city ?? null,
            stateCode: loc.stateCode ?? null,
            stateFips: loc.stateFips ?? null,
            countyFips: loc.countyFips ?? null,
            countyName: loc.countyName ?? null,
            latitude: lat,
            longitude: lon,
            precision: (loc.precision as 'address' | 'zip') ?? 'zip',
          }
        : null,
    timeline: record.timeline ?? '',
    disasters,
    helpTypes,
    homeStatus: record.homeStatus ?? '',
    household: record.household ?? [],
    name: record.displayName ?? '',
  };
}

export function deriveQuizStep(answers: RecoveryQuizAnswers, isLoggedIn: boolean): number {
  if (!answers.zipCode.trim()) return 0;
  if (!answers.timeline) return 1;
  if (answers.disasters.length === 0) return 2;
  if (answers.helpTypes.length === 0) return 3;
  if (!answers.homeStatus) return 5; // step 4 is filter confirmation, skip it
  if (answers.household.length === 0) return 6;
  if (isLoggedIn) return 0; // all fields complete — start fresh for retake
  return 7;
}

export function isQuizComplete(answers: RecoveryQuizAnswers): boolean {
  return (
    answers.zipCode.trim().length === 5 &&
    !!answers.timeline &&
    answers.disasters.length > 0 &&
    answers.helpTypes.length > 0 &&
    !!answers.homeStatus &&
    answers.household.length > 0
  );
}
