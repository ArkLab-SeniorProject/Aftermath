import { AssignmentOutlined, MenuBook, Quiz } from '@mui/icons-material';
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/molecules/page-container';

export default function RecoveryHub() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Recovery
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Tools and resources to help you recover after a disaster.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/recovery/quiz')}>
              <ListItemIcon>
                <Quiz color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Recovery Quiz'
                secondary='Tell us about your situation so we can help.'
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
          Need a recovery plan?
        </Typography>
        <Typography variant='body2' sx={{ mb: 2, opacity: 0.9 }}>
          Take the recovery quiz and we'll walk you through your next steps.
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
          Start the quiz
        </Button>
      </Paper>
    </PageContainer>
  );
}
