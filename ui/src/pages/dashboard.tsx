import { Paper, Typography } from '@mui/material';
import { useAuth } from '../auth/useAuth';
import { PageContainer } from '../components/molecules/page-container';

export default function Dashboard() {
  const { user } = useAuth();

  const displayName = (() => {
    if (user) {
      return user.firstName?.trim() || user.username?.trim() || 'friend';
    }
    try {
      const stored = localStorage.getItem('recovery_quiz_answers');
      if (stored) {
        const answers = JSON.parse(stored);
        if (answers.name?.trim()) return answers.name.trim();
      }
    } catch {}
    return 'friend';
  })();

  return (
    <PageContainer>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Welcome back, {displayName}.
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Here&rsquo;s your home base for recovery and preparedness.
      </Typography>

      <Paper
        sx={{
          p: 3,
          border: '1px dashed',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          Recovery resources and next steps will appear here.
        </Typography>
      </Paper>
    </PageContainer>
  );
}
