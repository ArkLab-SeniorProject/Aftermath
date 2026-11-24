import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '../components/base-web';

export default function NotFoundRoute() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant='h1' color='primary' fontWeight={700}>
        404
      </Typography>
      <Typography variant='h5'>Page not found</Typography>
      <Typography variant='body1' color='text.secondary'>
        The page you are looking for does not exist.
      </Typography>
      <Button variant='contained' onClick={() => navigate('/')}>
        Go home
      </Button>
    </Box>
  );
}
