import { useState } from 'react';
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apolloClient } from '../../lib/apollo-client';
import {
  ForgotPasswordDocument,
  type ForgotPasswordMutation,
  type ForgotPasswordMutationVariables,
} from '../../generated';
import { AuthCard } from './auth-card';

type Step = 'email' | 'sent';

export function ForgotPasswordContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apolloClient.mutate<ForgotPasswordMutation, ForgotPasswordMutationVariables>({
        mutation: ForgotPasswordDocument,
        variables: { email: email.trim().toLowerCase() },
      });
      setStep('sent');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard onBack={() => navigate('/login')}>
      {step === 'email' && (
        <>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Forgot password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the email address you used to create your account and we&rsquo;ll send you a
            link to reset your password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Email address:
            </Typography>
            <TextField
              placeholder="jane@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.75 }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 4 }}>
            Remember your password?{' '}
            <Link
              component="button"
              variant="body2"
              underline="always"
              onClick={() => navigate('/login')}
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              Sign in
            </Link>
          </Typography>
        </>
      )}

      {step === 'sent' && (
        <>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Check your email.
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            If an account exists for {email}, a password reset link has been sent. The link
            expires in 15 minutes.
          </Alert>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ py: 1.75 }}
            onClick={() => navigate('/login')}
          >
            Back to sign in
          </Button>
        </>
      )}
    </AuthCard>
  );
}

export default ForgotPasswordContent;
