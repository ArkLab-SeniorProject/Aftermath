// Changes for the Census Geocoder / recovery quiz work
import {
  // added the guest and update operations
  ClaimGuestSituationDocument,
  type ClaimGuestSituationMutation,
  type ClaimGuestSituationMutationVariables,
  CreateSituationDocument,
  type CreateSituationInput,
  type CreateSituationMutation,
  type CreateSituationMutationVariables,
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
  SaveGuestSituationDocument,
  type SaveGuestSituationMutation,
  type SaveGuestSituationMutationVariables,
  UpdateSituationDocument,
  type UpdateSituationMutation,
  type UpdateSituationMutationVariables,
} from '../generated';
import type { RecoveryQuizAnswers } from '../pages/recovery/quiz';
import { apolloClient } from './apollo-client';

const STORAGE_KEY = 'recovery_quiz_answers';
const SYNCED_KEY = 'recovery_quiz_synced';
// Secret that lets this browser reopen its guest situation (no account needed)
export const GUEST_TOKEN_KEY = 'recovery_guest_token';

export function getGuestToken(): string | null {
  try {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  } catch {
    return null;
  }
}

// CHANGED: now exported, and sends the geocoded location (county, state codes,
// coordinates) when the quiz found one. Falls back to just the ZIP like before
export function quizAnswersToInput(answers: RecoveryQuizAnswers): CreateSituationInput {
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

// NEW: called by the quiz when it finishes
/**
 * Saves finished quiz answers to the database.
 * - Logged in: creates or updates the user's one situation.
 * - Guest: creates or updates a guest situation and keeps its token in localStorage.
 * Throws on failure; the caller still has the localStorage copy.
 */
export async function saveRecoveryQuiz(
  answers: RecoveryQuizAnswers,
  userId?: string | null
): Promise<void> {
  const input = quizAnswersToInput(answers);

  if (userId) {
    const { data } = await apolloClient.query<
      GetSituationsByUserQuery,
      GetSituationsByUserQueryVariables
    >({
      query: GetSituationsByUserDocument,
      variables: { userId },
      fetchPolicy: 'network-only',
    });
    const existing = data?.getSituationsByUser[0];
    if (existing) {
      await apolloClient.mutate<UpdateSituationMutation, UpdateSituationMutationVariables>({
        mutation: UpdateSituationDocument,
        variables: { id: existing.id, input },
      });
    } else {
      await apolloClient.mutate<CreateSituationMutation, CreateSituationMutationVariables>({
        mutation: CreateSituationDocument,
        variables: { input },
      });
    }
    localStorage.setItem(SYNCED_KEY, 'true');
    return;
  }

  const { data } = await apolloClient.mutate<
    SaveGuestSituationMutation,
    SaveGuestSituationMutationVariables
  >({
    mutation: SaveGuestSituationDocument,
    variables: { input, guestToken: getGuestToken() },
  });
  const token = data?.saveGuestSituation.guestToken;
  if (token) localStorage.setItem(GUEST_TOKEN_KEY, token);
}

// CHANGED: first claims this browser's guest situation (if any) onto the account.
// If there is no guest token, it does exactly what it did before

// Runs after login / sign-up. Moves this browser's guest situation onto the account,
// or (older flow) creates one from localStorage answers that were never saved.

export async function syncRecoverySituationIfNeeded(): Promise<void> {
  try {
    const guestToken = getGuestToken();
    if (guestToken) {
      await apolloClient.mutate<ClaimGuestSituationMutation, ClaimGuestSituationMutationVariables>({
        mutation: ClaimGuestSituationDocument,
        variables: { guestToken },
      });
      localStorage.removeItem(GUEST_TOKEN_KEY);
      localStorage.setItem(SYNCED_KEY, 'true');
      return;
    }

    const alreadySynced = localStorage.getItem(SYNCED_KEY);
    if (alreadySynced) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const answers: RecoveryQuizAnswers = JSON.parse(raw);
    const input = quizAnswersToInput(answers);
    const storedUser = JSON.parse(localStorage.getItem('authUser') ?? 'null') as {
      id?: string;
    } | null;
    if (!storedUser?.id) return;

    const { data: existingData } = await apolloClient.query<
      GetSituationsByUserQuery,
      GetSituationsByUserQueryVariables
    >({
      query: GetSituationsByUserDocument,
      variables: { userId: storedUser.id },
      fetchPolicy: 'network-only',
    });
    if (existingData?.getSituationsByUser.length) {
      localStorage.setItem(SYNCED_KEY, 'true');
      return;
    }

    await apolloClient.mutate<CreateSituationMutation, CreateSituationMutationVariables>({
      mutation: CreateSituationDocument,
      variables: { input },
    });

    localStorage.setItem(SYNCED_KEY, 'true');
  } catch (err) {
    console.error('[syncRecoverySituation] Failed:', err);
  }
}
