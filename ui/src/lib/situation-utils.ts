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
    disaster: answers.disaster || null,
    helpTypes: answers.helpTypes.filter((value) => value !== 'unsure'),
    helpDetails: answers.helpDetails,
    insurance: answers.insurance,
    homeStatus: answers.homeStatus,
    primaryResidence: answers.primaryResidence,
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
  disaster?: string | null;
  helpTypes?: string[] | null;
  helpDetails?: string[] | null;
  insurance?: string[] | null;
  homeStatus?: string | null;
  primaryResidence?: boolean | null;
  household?: string[] | null;
  femaApplied?: boolean | null;
}): RecoveryQuizAnswers {
  const helpTypes: string[] = [];
  helpTypes.push(...(record.helpTypes ?? []));

  const disaster = record.disaster ?? '';

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
    disaster,
    helpTypes,
    helpDetails: record.helpDetails ?? [],
    insurance: record.insurance ?? [],
    homeStatus: record.homeStatus ?? '',
    primaryResidence: record.primaryResidence ?? true,
    household: record.household ?? [],
    name: '',
  };
}

export function deriveQuizStep(answers: RecoveryQuizAnswers, isLoggedIn: boolean): number {
  if (!answers.zipCode.trim()) return 0;
  if (!answers.timeline) return 1;
  if (!answers.disaster) return 2;
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
    !!answers.disaster &&
    answers.helpTypes.length > 0 &&
    !!answers.homeStatus &&
    answers.household.length > 0
  );
}
