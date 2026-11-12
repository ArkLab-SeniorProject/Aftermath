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
    title: 'Ready.gov',
    description: 'Official U.S. government preparedness information.',
    url: 'https://www.ready.gov',
  },
  {
    title: 'FEMA Emergency Alerts',
    description: 'Sign up for local emergency alerts and warnings.',
    url: 'https://www.fema.gov/emergency-managers/practitioners/integrated-public-alert-warning-system',
  },
  {
    title: 'Red Cross Preparedness',
    description: 'Disaster preparedness guides from the American Red Cross.',
    url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html',
  },
  {
    title: 'CDC Emergency Preparedness',
    description: 'Health-related emergency preparedness resources.',
    url: 'https://www.cdc.gov/prepyourhealth/',
  },
];

export default function PreparednessResources() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/preparedness')} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
        <Typography variant='h5' fontWeight={600}>
          Resources
        </Typography>
      </Box>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Helpful links and reference materials for emergency preparedness.
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
