import { LogoutOutlined } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Divider, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import {
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
} from '../generated';
import { apolloClient } from '../lib/apollo-client';
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

export default function Dashboard() {
  const { user, logout } = useAuth();
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
      <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 6, textAlign: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!situation) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 3, textAlign: 'center' }}>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          No recovery plan yet
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Complete the recovery quiz to see your plan here.
        </Typography>
        {user && (
          <Button
            variant='outlined'
            color='error'
            startIcon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            sx={{ mt: 3 }}
          >
            Log out
          </Button>
        )}
      </Box>
    );
  }

  const displayName = situation.name?.trim() || 'friend';

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Welcome back, {displayName}.
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Here&rsquo;s a summary of your situation and next steps.
      </Typography>

      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          Your Situation
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <InfoRow label='Location' value={situation.zipCode} />
        <InfoRow label='Timeline' value={situation.timeline} />
        <InfoRow label='Home status' value={situation.homeStatus} />
        <InfoRow label='Name' value={situation.name || '—'} />

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

      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          Recovery resources and next steps will appear here.
        </Typography>
      </Paper>

      {user && (
        <Button
          variant='outlined'
          color='error'
          startIcon={<LogoutOutlined />}
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
          sx={{ mt: 3, width: '100%' }}
        >
          Log out
        </Button>
      )}
    </Box>
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
