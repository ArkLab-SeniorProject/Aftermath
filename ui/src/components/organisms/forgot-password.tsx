import { useState } from 'react';
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
import {
  HelpOutline,
  LockOutlined,
  PersonOutline,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apolloClient } from '../../lib/apollo-client';
import {
  GetSecurityQuestionDocument,
  ResetPasswordDocument,
  type GetSecurityQuestionQuery,
  type GetSecurityQuestionQueryVariables,
  type ResetPasswordMutation,
  type ResetPasswordMutationVariables,
} from '../../generated';

type Step = 'username' | 'answer' | 'success';

export function ForgotPasswordContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apolloClient.query<
        GetSecurityQuestionQuery,
        GetSecurityQuestionQueryVariables
      >({
        query: GetSecurityQuestionDocument,
        variables: { username: username.trim() },
        fetchPolicy: 'network-only',
      });

      if (!data?.getSecurityQuestion) {
        setError('No account found with that username');
        return;
      }

      setSecurityQuestion(data.getSecurityQuestion);
      setStep('answer');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apolloClient.mutate<
        ResetPasswordMutation,
        ResetPasswordMutationVariables
      >({
        mutation: ResetPasswordDocument,
        variables: {
          username: username.trim(),
          securityAnswer: securityAnswer.trim(),
          newPassword,
        },
      });

      if (data?.resetPassword) {
        setStep('success');
      } else {
        setError('Incorrect security answer');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          {step === 'username' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Forgot password
              </Typography>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                Enter your username to look up your security question.
              </Typography>

              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component='form'
                onSubmit={handleLookup}
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
                  disabled={loading}
                />
                <Button type='submit' variant='contained' size='large' fullWidth disabled={loading}>
                  {loading ? 'Looking up...' : 'Continue'}
                </Button>
              </Box>
            </>
          )}

          {step === 'answer' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Reset password
              </Typography>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                Answer your security question to set a new password.
              </Typography>

              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component='form'
                onSubmit={handleReset}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label='Security Question'
                  value={securityQuestion}
                  fullWidth
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <HelpOutline color='disabled' />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label='Your Answer'
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
                  disabled={loading}
                />
                <TextField
                  label='New Password'
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  disabled={loading}
                />
                <TextField
                  label='Confirm New Password'
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
                  disabled={loading}
                />
                <Button type='submit' variant='contained' size='large' fullWidth disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </Button>
              </Box>
            </>
          )}

          {step === 'success' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Password reset
              </Typography>
              <Alert severity='success' sx={{ mb: 2 }}>
                Your password has been updated successfully.
              </Alert>
              <Button variant='contained' size='large' fullWidth onClick={() => navigate('/login')}>
                Back to sign in
              </Button>
            </>
          )}

          {step !== 'success' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2'>
                Remember your password?{' '}
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
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPasswordContent;
