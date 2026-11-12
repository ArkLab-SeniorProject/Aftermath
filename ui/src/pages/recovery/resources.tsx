import { ArrowBack, OpenInNew } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/molecules/page-container';

const RESOURCES = [
  {
    title: 'DisasterAssistance.gov',
    description: 'Apply for FEMA disaster assistance online.',
    url: 'https://www.disasterassistance.gov',
  },
  {
    title: 'FEMA — After a Disaster',
    description: 'Steps to take immediately after a disaster.',
    url: 'https://www.fema.gov/disaster/recover',
  },
  {
    title: 'SBA Disaster Loans',
    description: 'Low-interest disaster loans for homeowners and businesses.',
    url: 'https://www.sba.gov/funding-programs/disaster-assistance',
  },
  {
    title: 'Red Cross Recovery',
    description: 'Recovery services and shelter information.',
    url: 'https://www.redcross.org/get-help/disaster-relief-and-recovery-services.html',
  },
  {
    title: '211.org',
    description: 'Connect to local community resources and social services.',
    url: 'https://www.211.org',
  },
];

export default function RecoveryResources() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/recovery')} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
        <Typography variant='h5' fontWeight={600}>
          Recovery Resources
        </Typography>
      </Box>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Helpful links for disaster recovery assistance.
      </Typography>

      <Paper>
        <List disablePadding>
          {RESOURCES.map((resource, i) => (
            <ListItem
              key={resource.title}
              divider={i < RESOURCES.length - 1}
              secondaryAction={<OpenInNew fontSize='small' color='disabled' />}
            >
              <ListItemText
                primary={
                  <Link
                    href={resource.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    color='primary'
                  >
                    {resource.title}
                  </Link>
                }
                secondary={resource.description}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </PageContainer>
  );
}
