import {
  CreateSituationDocument,
  type CreateSituationMutation,
  type CreateSituationMutationVariables,
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
} from '../generated';
import type { RecoveryQuizAnswers } from '../pages/recovery/quiz';
import { apolloClient } from './apollo-client';
import { quizAnswersToInput } from './situation-utils';

const STORAGE_KEY = 'recovery_quiz_answers';
const SYNCED_KEY = 'recovery_quiz_synced';

function clearLocalQuizData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('recovery_quiz_complete');
  localStorage.removeItem('recovery_quiz_draft_step');
}

export async function syncRecoverySituationIfNeeded(): Promise<void> {
  try {
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
      clearLocalQuizData();
      localStorage.setItem(SYNCED_KEY, 'true');
      return;
    }

    await apolloClient.mutate<CreateSituationMutation, CreateSituationMutationVariables>({
      mutation: CreateSituationDocument,
      variables: { input },
    });

    clearLocalQuizData();
    localStorage.setItem(SYNCED_KEY, 'true');
  } catch (err) {
    console.error('[syncRecoverySituation] Failed:', err);
  }
}
