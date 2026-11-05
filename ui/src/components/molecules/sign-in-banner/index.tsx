import { Login } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function SignInBanner() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        py: 1.5,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Typography variant='body2' sx={{ flex: 1 }}>
        Sign in to save your plan and resources.
      </Typography>
      <Button
        variant='outlined'
        size='small'
        startIcon={<Login />}
        onClick={() => navigate('/login')}
        sx={{
          color: 'inherit',
          borderColor: 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap',
          '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        Sign in
      </Button>
    </Box>
  );
}

export default SignInBanner;
