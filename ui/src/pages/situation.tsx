import { EditOutlined } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import {
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
} from '../generated';
import { apolloClient } from '../lib/apollo-client';
import { PageContainer } from '../components/molecules/page-container';
import type { RecoveryQuizAnswers } from './recovery/quiz';

interface SituationDisplay {
  zipCode: string;
  timeline: string;
  disasters: string[];
  helpTypes: string[];
  homeStatus: string;
  household: string[];
  name: string;
}

function fromLocalStorage(): SituationDisplay | null {
  try {
    const stored = localStorage.getItem('recovery_quiz_answers');
    if (!stored) return null;
    const answers: RecoveryQuizAnswers = JSON.parse(stored);
    return {
      zipCode: answers.zipCode,
      timeline: answers.timeline,
      disasters: answers.disasters,
      helpTypes: answers.helpTypes,
      homeStatus: answers.homeStatus,
      household: answers.household,
      name: answers.name,
    };
  } catch {
    return null;
  }
}

function fromDbRecord(record: any): SituationDisplay {
  const helpTypes: string[] = [];
  if (record.helpTypes?.housing) helpTypes.push('Housing');
  if (record.helpTypes?.financial) helpTypes.push('Financial');
  if (record.helpTypes?.damage) helpTypes.push('Property Damage');
  const toArray = (val: unknown): string[] =>
    Array.isArray(val)
      ? val
      : typeof val === 'string'
        ? val
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

  return {
    zipCode: record.location?.zip ?? '',
    timeline: record.timeline ?? '',
    disasters: toArray(record.disasters),
    helpTypes,
    homeStatus: record.homeStatus ?? '',
    household: toArray(record.household),
    name: record.displayName ?? '',
  };
}

export default function SituationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [situation, setSituation] = useState<SituationDisplay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (user) {
        try {
          const { data } = await apolloClient.query<
            GetSituationsByUserQuery,
            GetSituationsByUserQueryVariables
          >({
            query: GetSituationsByUserDocument,
            variables: { userId: user.id },
            fetchPolicy: 'network-only',
          });
          if (!cancelled) {
            const records = data?.getSituationsByUser;
            if (records && records.length > 0) {
              setSituation(fromDbRecord(records[0]));
            } else {
              setSituation(fromLocalStorage());
            }
          }
        } catch {
          if (!cancelled) setSituation(fromLocalStorage());
        }
      } else {
        setSituation(fromLocalStorage());
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        My Situation
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        A summary of what you told us about your circumstances.
      </Typography>

      {!situation ? (
        <Paper
          sx={{
            p: 3,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant='body1' gutterBottom>
            No situation recorded yet.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Complete the recovery quiz to tell us about your situation.
          </Typography>
          <Button variant='contained' onClick={() => navigate('/recovery/quiz')}>
            Take the recovery quiz
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 2 }}>
            <InfoRow label='Location' value={situation.zipCode} />
            <InfoRow label='Timeline' value={situation.timeline} />
            <InfoRow label='Home status' value={situation.homeStatus} />

            {situation.disasters.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Disasters
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {situation.disasters.map((d) => (
                    <Chip key={d} label={d} size='small' />
                  ))}
                </Box>
              </Box>
            )}

            {situation.helpTypes.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Help needed
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {situation.helpTypes.map((h) => (
                    <Chip key={h} label={h} size='small' color='primary' variant='outlined' />
                  ))}
                </Box>
              </Box>
            )}

            {situation.household.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Household
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {situation.household.map((h) => (
                    <Chip key={h} label={h} size='small' variant='outlined' />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          <Button
            variant='outlined'
            startIcon={<EditOutlined />}
            fullWidth
            onClick={() => navigate('/recovery/quiz')}
          >
            Retake recovery quiz
          </Button>
        </>
      )}
    </PageContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2'>{value || '—'}</Typography>
    </Box>
  );
}
