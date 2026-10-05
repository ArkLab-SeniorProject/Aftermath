import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EMERGENCY_RESOURCES = [
  { label: 'FEMA Helpline', value: '1-800-621-3362', note: '24/7, free' },
  { label: 'Disaster Distress Helpline', value: '1-800-985-5990', note: 'Call or text' },
  { label: '211', value: '211', note: 'Local resources' },
];

export default function SupportRoute() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 1 }}>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Immediate support
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        If you need help right now, reach out to one of these resources.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {EMERGENCY_RESOURCES.map((r) => (
          <Paper key={r.label} elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              {r.label}
            </Typography>
            <Typography variant='h5' fontWeight={700} sx={{ mt: 0.5 }}>
              {r.value}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {r.note}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Once you're safe, we can help you find longer-term recovery resources.
      </Typography>

      <Button
        variant='outlined'
        fullWidth
        size='large'
        sx={{ py: 1.75 }}
        onClick={() => navigate('/quiz')}
      >
        Build my recovery guide
      </Button>
    </Box>
  );
}
