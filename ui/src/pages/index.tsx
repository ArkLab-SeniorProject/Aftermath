import { Box, Button, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomeRoute() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        px: 2,
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant='h1' component='h1' fontWeight={700} sx={{ mb: 1 }}>
        Aftermath
      </Typography>
      <Typography variant='h2' component='h1' fontWeight={700} sx={{ mb: 1 }}>
        What happens in the aftermath?
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 400, mb: 3 }}>
        We help create a simple, personalized plan based on what you need right now.
      </Typography>

      <Button
        variant='contained'
        size='large'
        fullWidth
        sx={{ maxWidth: 400, py: 2, fontSize: '1.05rem' }}
        onClick={() => navigate('/quiz')}
      >
        Build my recovery guide
      </Button>

      <Button
        variant='outlined'
        size='large'
        fullWidth
        sx={{ maxWidth: 400, py: 2, fontSize: '1.05rem' }}
        onClick={() => navigate('/support')}
      >
        I need immediate support
      </Button>

        <Typography variant='body2' color='text.secondary' component='span'>
          Have an account?{' '}
            <Link
            component='button'
            variant='body2'
            onClick={() => navigate('/login')}
            underline='hover'
          >
            Sign in
          </Link>
        </Typography>
        <Typography variant='body2' color='text.secondary' component='span'>
            New Here?{' '}
            <Link
            component='button'
            variant='body2'
            onClick={() => navigate('/login')}
            underline='hover'
          >
            Create an account
          </Link>
          </Typography>
    </Box>
  );
}
