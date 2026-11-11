import { AssignmentOutlined, MenuBook, PlayArrow, Quiz, Replay } from '@mui/icons-material';
import {
  Alert,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { PageContainer } from '../../components/molecules/page-container';
import {
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
} from '../../generated';
import { apolloClient } from '../../lib/apollo-client';
import { isQuizComplete, situationToQuizAnswers } from '../../lib/situation-utils';

type QuizStatus = 'loading' | 'complete' | 'in-progress' | 'not-started';

function useQuizStatus(): QuizStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<QuizStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function check() {
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
          if (!cancelled && data?.getSituationsByUser.length) {
            const answers = situationToQuizAnswers(data.getSituationsByUser[0]);
            setStatus(isQuizComplete(answers) ? 'complete' : 'in-progress');
            return;
          }
        } catch { /* fall through */ }
      }

      if (!cancelled) {
        try {
          const stored = localStorage.getItem('recovery_quiz_answers');
          if (stored) {
            setStatus('in-progress');
            return;
          }
        } catch { /* ignore */ }
        setStatus('not-started');
      }
    }

    check();
    return () => { cancelled = true; };
  }, [user]);

  return status;
}

export default function RecoveryHub() {
  const navigate = useNavigate();
  const quizStatus = useQuizStatus();

  return (
    <PageContainer>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Recovery
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Tools and resources to help you recover after a disaster.
      </Typography>

      {quizStatus === 'in-progress' && (
        <Alert
          severity='info'
          sx={{ mb: 3 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => navigate('/recovery/quiz')}
              startIcon={<PlayArrow />}
            >
              Continue
            </Button>
          }
        >
          You have an unfinished recovery quiz. Pick up where you left off.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/recovery/quiz')}>
              <ListItemIcon>
                {quizStatus === 'complete' ? <Replay color='primary' /> : <Quiz color='primary' />}
              </ListItemIcon>
              <ListItemText
                primary={quizStatus === 'complete' ? 'Retake Recovery Quiz' : 'Recovery Quiz'}
                secondary={
                  quizStatus === 'complete'
                    ? 'Update your answers and get a refreshed plan.'
                    : quizStatus === 'in-progress'
                      ? 'Continue where you left off.'
                      : 'Tell us about your situation so we can help.'
                }
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/situation')}>
              <ListItemIcon>
                <AssignmentOutlined color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='My Situation'
                secondary='View or update your recorded situation.'
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/recovery/resources')}>
              <ListItemIcon>
                <MenuBook color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Recovery Resources'
                secondary='Guides for filing claims, finding aid, and more.'
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Typography variant='subtitle1' fontWeight={600} gutterBottom>
          {quizStatus === 'complete' ? 'Want to update your plan?' : 'Need a recovery plan?'}
        </Typography>
        <Typography variant='body2' sx={{ mb: 2, opacity: 0.9 }}>
          {quizStatus === 'complete'
            ? 'Retake the quiz to refresh your recovery steps.'
            : "Take the recovery quiz and we'll walk you through your next steps."}
        </Typography>
        <Button
          variant='outlined'
          onClick={() => navigate('/recovery/quiz')}
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {quizStatus === 'complete' ? 'Retake the quiz' : 'Start the quiz'}
        </Button>
      </Paper>
    </PageContainer>
  );
}
