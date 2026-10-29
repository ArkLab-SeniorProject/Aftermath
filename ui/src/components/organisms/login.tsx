import { LockOutlined, PersonOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { syncRecoverySituationIfNeeded } from '../../lib/sync-recovery-situation';

export function LoginContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth='sm'>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
            Welcome back
          </Typography>
          <Typography variant='body1' color='text.secondary' gutterBottom>
            Sign in to continue to Senior Project.
          </Typography>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PersonOutline color='disabled' />
                    </InputAdornment>
                  ),
                },
              }}
              disabled={auth.loading}
            />
            <TextField
              label='Password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined color='disabled' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge='end'
                        disabled={auth.loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              disabled={auth.loading}
            />
            <Button
              type='submit'
              variant='contained'
              size='large'
              fullWidth
              disabled={auth.loading}
            >
              {auth.loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant='body2'>
              New to Senior Project?{' '}
              <Link
                component='button'
                variant='body2'
                underline='hover'
                onClick={() => navigate('/create-account')}
              >
                Create an account
              </Link>
            </Typography>
            <Typography variant='body2'>
              <Link
                component='button'
                variant='body2'
                underline='hover'
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginContent;
