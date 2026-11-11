import {
  CreateSituationDocument,
  type CreateSituationMutation,
  type CreateSituationMutationVariables,
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
  UpdateSituationDocument,
  type UpdateSituationMutation,
  type UpdateSituationMutationVariables,
} from '../generated';
import type { RecoveryQuizAnswers } from '../pages/recovery/quiz';
import { apolloClient } from './apollo-client';
import { isQuizComplete, quizAnswersToInput } from './situation-utils';

const STORAGE_KEY = 'recovery_quiz_answers';
const SYNCED_KEY = 'recovery_quiz_synced';

function clearLocalQuizDataIfUnchanged(snapshot: string) {
  try {
    if (localStorage.getItem(STORAGE_KEY) === snapshot) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('recovery_quiz_complete');
      localStorage.removeItem('recovery_quiz_draft_step');
    }
  } catch {
    /* ignore */
  }
}

export type SyncResult =
  | { status: 'no_action' }
  | { status: 'synced' }
  | { status: 'conflict'; localAnswers: RecoveryQuizAnswers; situationId: string };

export async function syncRecoverySituationIfNeeded(): Promise<SyncResult> {
  try {
    const alreadySynced = localStorage.getItem(SYNCED_KEY);
    if (alreadySynced) return { status: 'no_action' };

    const rawSnapshot = localStorage.getItem(STORAGE_KEY);
    if (!rawSnapshot) return { status: 'no_action' };

    const localAnswers: RecoveryQuizAnswers = JSON.parse(rawSnapshot);
    if (!isQuizComplete(localAnswers)) return { status: 'no_action' };

    const storedUser = JSON.parse(localStorage.getItem('authUser') ?? 'null') as {
      id?: string;
    } | null;
    if (!storedUser?.id) return { status: 'no_action' };

    const { data: existingData } = await apolloClient.query<
      GetSituationsByUserQuery,
      GetSituationsByUserQueryVariables
    >({
      query: GetSituationsByUserDocument,
      variables: { userId: storedUser.id },
      fetchPolicy: 'network-only',
    });

    if (existingData?.getSituationsByUser.length) {
      const existing = existingData.getSituationsByUser[0];
      return { status: 'conflict', localAnswers, situationId: existing.id };
    }

    const input = quizAnswersToInput(localAnswers);
    await apolloClient.mutate<CreateSituationMutation, CreateSituationMutationVariables>({
      mutation: CreateSituationDocument,
      variables: { input },
    });

    clearLocalQuizDataIfUnchanged(rawSnapshot);
    localStorage.setItem(SYNCED_KEY, 'true');
    return { status: 'synced' };
  } catch (err) {
    console.error('[syncRecoverySituation] Failed:', err);
    return { status: 'no_action' };
  }
}

export async function overwriteSituationWithLocal(
  situationId: string,
  answers: RecoveryQuizAnswers
): Promise<void> {
  const input = quizAnswersToInput(answers);
  await apolloClient.mutate<UpdateSituationMutation, UpdateSituationMutationVariables>({
    mutation: UpdateSituationDocument,
    variables: { id: situationId, input },
  });
  const rawSnapshot = localStorage.getItem(STORAGE_KEY);
  if (rawSnapshot) clearLocalQuizDataIfUnchanged(rawSnapshot);
  localStorage.setItem(SYNCED_KEY, 'true');
}

export function dismissConflictAndKeepServer(): void {
  const rawSnapshot = localStorage.getItem(STORAGE_KEY);
  if (rawSnapshot) clearLocalQuizDataIfUnchanged(rawSnapshot);
  localStorage.setItem(SYNCED_KEY, 'true');
}
