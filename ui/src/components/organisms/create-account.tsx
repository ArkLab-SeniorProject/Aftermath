import {
  BadgeOutlined,
  EmailOutlined,
  LockOutlined,
  PersonOutline,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
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

export function CreateAccountContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await auth.signup(
      username.trim(),
      email.trim().toLowerCase(),
      firstName.trim(),
      password
    );
    if (result.success) {
      navigate('/dashboard', { replace: true });
      void syncRecoverySituationIfNeeded();
    } else {
      setError(result.error ?? 'Failed to create account');
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
            Create an account
          </Typography>
          <Typography variant='body1' color='text.secondary' gutterBottom>
            Get started with your recovery guide.
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
              label='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <BadgeOutlined color='disabled' />
                    </InputAdornment>
                  ),
                },
              }}
              disabled={auth.loading}
            />
            <TextField
              label='Email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailOutlined color='disabled' />
                    </InputAdornment>
                  ),
                },
              }}
              disabled={auth.loading}
            />
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
            <TextField
              label='Confirm Password'
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined color='disabled' />
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
              {auth.loading ? 'Creating account...' : 'Create account'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant='body2'>
              Already have an account?{' '}
              <Link
                component='button'
                variant='body2'
                underline='hover'
                onClick={() => navigate('/login')}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateAccountContent;
