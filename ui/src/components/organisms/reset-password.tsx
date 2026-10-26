import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { apolloClient } from '../../lib/apollo-client';
import {
  ResetPasswordWithTokenDocument,
  ValidateResetTokenDocument,
  type ResetPasswordWithTokenMutation,
  type ResetPasswordWithTokenMutationVariables,
  type ValidateResetTokenQuery,
  type ValidateResetTokenQueryVariables,
} from '../../generated';

type Step = 'validating' | 'form' | 'invalid' | 'success';

export function ResetPasswordContent() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('validating');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStep('invalid');
      return;
    }

    (async () => {
      try {
        const { data } = await apolloClient.query<
          ValidateResetTokenQuery,
          ValidateResetTokenQueryVariables
        >({
          query: ValidateResetTokenDocument,
          variables: { token },
          fetchPolicy: 'network-only',
        });

        setStep(data?.validateResetToken ? 'form' : 'invalid');
      } catch {
        setStep('invalid');
      }
    })();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apolloClient.mutate<
        ResetPasswordWithTokenMutation,
        ResetPasswordWithTokenMutationVariables
      >({
        mutation: ResetPasswordWithTokenDocument,
        variables: { token: token!, newPassword: password },
      });
      setStep('success');
    } catch {
      setError('Something went wrong. The link may have expired.');
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
          {step === 'validating' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                Verifying your reset link...
              </Typography>
            </Box>
          )}

          {step === 'invalid' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Link expired
              </Typography>
              <Alert severity='error' sx={{ mb: 2 }}>
                This password reset link is invalid or has expired. Please
                request a new one.
              </Alert>
              <Button
                variant='contained'
                size='large'
                fullWidth
                onClick={() => navigate('/forgot-password')}
              >
                Request a new link
              </Button>
            </>
          )}

          {step === 'form' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Set a new password
              </Typography>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                Enter your new password below.
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
                  label='New Password'
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
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </Button>
              </Box>
            </>
          )}

          {step === 'success' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Password updated
              </Typography>
              <Alert severity='success' sx={{ mb: 2 }}>
                Your password has been reset successfully.
              </Alert>
              <Button
                variant='contained'
                size='large'
                fullWidth
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPasswordContent;
