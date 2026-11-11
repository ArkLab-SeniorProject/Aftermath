import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { syncRecoverySituationIfNeeded } from '../../lib/sync-recovery-situation';
import { AuthCard } from './auth-card';

export function LoginContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const success = await auth.login(username.trim(), password);
    if (success) {
      navigate('/dashboard', { replace: true });
      void syncRecoverySituationIfNeeded();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <AuthCard onBack={() => navigate('/')}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
        Sign-in your account.
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Enter your username and password to see your plan.
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
      >
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          Username:
        </Typography>
        <TextField
          placeholder='Enter your username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 2 }}
        />

        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          Password:
        </Typography>
        <TextField
          placeholder='Enter your password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 3 }}
        />

        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={auth.loading}
          sx={{ py: 1.75 }}
        >
          {auth.loading ? 'Signing in...' : 'Sign-in'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          component='button'
          variant='body2'
          underline='always'
          onClick={() => navigate('/forgot-password')}
          sx={{ color: 'text.primary', fontWeight: 500 }}
        >
          Forgot your password?
        </Link>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Typography variant='body2' sx={{ textAlign: 'center', mt: 4 }}>
        New here?{' '}
        <Link
          component='button'
          variant='body2'
          underline='always'
          onClick={() => navigate('/create-account')}
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          Choose a plan to get started.
        </Link>
      </Typography>
    </AuthCard>
  );
}

export default LoginContent;
