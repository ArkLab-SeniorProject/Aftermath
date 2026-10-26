import { Box, Button, Chip, Divider, Paper, Typography } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { syncRecoverySituationIfNeeded } from '../lib/sync-recovery-situation';
import type { RecoveryQuizAnswers } from './recovery/quiz';

const STORAGE_KEY = 'recovery_quiz_answers';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<RecoveryQuizAnswers | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAnswers(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (user) {
      syncRecoverySituationIfNeeded();
    }
  }, [user]);

  if (!answers) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 3, textAlign: 'center' }}>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          No recovery plan yet
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Complete the recovery quiz to see your plan here.
        </Typography>
      </Box>
    );
  }

  const displayName = answers.name?.trim() || 'friend';

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

        <InfoRow label='Location' value={answers.zipCode} />
        <InfoRow label='Timeline' value={answers.timeline} />
        <InfoRow label='Home status' value={answers.homeStatus} />
        <InfoRow label='Name' value={answers.name || '—'} />

        {answers.disasters.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant='caption' color='text.secondary'>
              Disasters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {answers.disasters.map((d) => (
                <Chip key={d} label={d} size='small' />
              ))}
            </Box>
          </Box>
        )}

        {answers.helpTypes.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant='caption' color='text.secondary'>
              Help needed
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {answers.helpTypes.map((h) => (
                <Chip key={h} label={h} size='small' color='primary' variant='outlined' />
              ))}
            </Box>
          </Box>
        )}

        {answers.household.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant='caption' color='text.secondary'>
              Household
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {answers.household.map((h) => (
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
