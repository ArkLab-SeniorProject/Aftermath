import { Box, Button, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 3,
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Typography
        variant='h3'
        component='h1'
        fontWeight={700}
        sx={{ mb: 2, color: 'primary.main' }}
      >
        a clear path forward
      </Typography>

      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ maxWidth: 420, mb: 5, lineHeight: 1.7 }}
      >
        After a natural disaster, figuring out what to do next can feel overwhelming.
        <br />
        <br />
        Tell us a little about your situation, and we&rsquo;ll help you find your next step.
      </Typography>

      <Button
        variant='contained'
        size='large'
        fullWidth
        sx={{ maxWidth: 360, py: 2, fontSize: '1.05rem', mb: 2 }}
        onClick={() => navigate('/recovery/quiz')}
      >
        Create my recovery plan
      </Button>

      <Button
        variant='outlined'
        size='large'
        fullWidth
        sx={{ maxWidth: 360, py: 2, fontSize: '1.05rem', mb: 4 }}
        onClick={() => navigate('/preparedness/quiz')}
      >
        Create my preparedness plan
      </Button>

      <Typography variant='body2' color='text.secondary'>
        Already have an account?{' '}
        <Link
          component='button'
          variant='body2'
          onClick={() => navigate('/login')}
          underline='hover'
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
