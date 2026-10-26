import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function PreparednessQuiz() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate('/')} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
      </Box>

      <Typography variant='h5' fontWeight={600} gutterBottom>
        Preparedness Plan
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        This quiz flow is coming soon. Check back later to build your
        preparedness plan.
      </Typography>
    </Box>
  );
}
