import { CheckCircleOutline, MenuBook, Quiz } from '@mui/icons-material';
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

export default function PreparednessHub() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Preparedness
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Get ready before disaster strikes. Build a plan, gather supplies, and know what to do.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/preparedness/quiz')}>
              <ListItemIcon>
                <Quiz color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Preparedness Quiz'
                secondary='Answer a few questions to build your preparedness plan.'
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/preparedness/checklist')}>
              <ListItemIcon>
                <CheckCircleOutline color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Emergency Checklist'
                secondary='Supplies and documents you should have ready.'
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/preparedness/resources')}>
              <ListItemIcon>
                <MenuBook color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Resources'
                secondary='Guides, contacts, and reference materials.'
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
          Not sure where to start?
        </Typography>
        <Typography variant='body2' sx={{ mb: 2, opacity: 0.9 }}>
          Take the preparedness quiz and we'll build a personalized plan for you.
        </Typography>
        <Button
          variant='outlined'
          onClick={() => navigate('/preparedness/quiz')}
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
