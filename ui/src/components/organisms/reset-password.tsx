import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
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
import { AuthCard } from './auth-card';

type Step = 'validating' | 'form' | 'invalid' | 'success';

export function ResetPasswordContent() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('validating');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        variables: { token: token as string, newPassword: password },
      });
      setStep('success');
    } catch {
      setError('Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard onBack={() => navigate('/login')}>
      {step === 'validating' && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={40} />
          <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
            Verifying your reset link...
          </Typography>
        </Box>
      )}

      {step === 'invalid' && (
        <>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
            Link expired
          </Typography>
          <Alert severity='error' sx={{ mb: 3 }}>
            This password reset link is invalid or has expired. Please request a new one.
          </Alert>
          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ py: 1.75 }}
            onClick={() => navigate('/forgot-password')}
          >
            Request a new link
          </Button>
        </>
      )}

      {step === 'form' && (
        <>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
            Set a new password.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
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
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              New password:
            </Typography>
            <TextField
              placeholder='Enter your new password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Confirm password:
            </Typography>
            <TextField
              placeholder='Re-enter your password'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type='submit'
              variant='contained'
              size='large'
              fullWidth
              disabled={loading}
              sx={{ py: 1.75 }}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </Box>
        </>
      )}

      {step === 'success' && (
        <>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
            Password updated.
          </Typography>
          <Alert severity='success' sx={{ mb: 3 }}>
            Your password has been reset successfully.
          </Alert>
          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ py: 1.75 }}
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        </>
      )}
    </AuthCard>
  );
}

export default ResetPasswordContent;
