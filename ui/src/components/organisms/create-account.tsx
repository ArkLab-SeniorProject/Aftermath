import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  LockOutlined,
  PersonOutline,
  BadgeOutlined,
  HelpOutline,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function CreateAccountContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
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
      firstName.trim(),
      password,
      securityQuestion.trim(),
      securityAnswer.trim()
    );
    if (result.success) {
      navigate('/', { replace: true });
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
            <TextField
              label='Security Question'
              select
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <HelpOutline color='disabled' />
                    </InputAdornment>
                  ),
                },
              }}
              disabled={auth.loading}
            >
              <MenuItem value=''>Select a question</MenuItem>
              <MenuItem value="What is your childhood pet's name?">
                What is your childhood pet's name?
              </MenuItem>
              <MenuItem value='What city were you born in?'>What city were you born in?</MenuItem>
              <MenuItem value='What was the name of your favorite stuffed toy?'>
                What was the name of your favorite stuffed toy?
              </MenuItem>
              <MenuItem value='What was your first job?'>What was your first job?</MenuItem>
              <MenuItem value="What is your oldest sibling's middle name?">
                What is your oldest sibling's middle name?
              </MenuItem>
              <MenuItem value='What was the name of your first school?'>
                What was the name of your first school?
              </MenuItem>
              <MenuItem value='What is your favorite sports team?'>
                What is your favorite sports team?
              </MenuItem>
            </TextField>
            <TextField
              label='Security Answer'
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <HelpOutline color='disabled' />
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
