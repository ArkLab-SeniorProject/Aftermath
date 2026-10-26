import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apolloClient } from '../../lib/apollo-client';
import {
  ForgotPasswordDocument,
  type ForgotPasswordMutation,
  type ForgotPasswordMutationVariables,
} from '../../generated';

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
          {step === 'email' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Forgot password
              </Typography>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                Enter the email address you used to create your account and
                we&rsquo;ll send you a link to reset your password.
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
                  disabled={loading}
                />
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </Box>
            </>
          )}

          {step === 'sent' && (
            <>
              <Typography variant='h4' component='h1' gutterBottom fontWeight={600}>
                Check your email
              </Typography>
              <Alert severity='success' sx={{ mb: 2 }}>
                If an account exists for {email}, a password reset link has been
                sent. The link expires in 15 minutes.
              </Alert>
              <Button
                variant='contained'
                size='large'
                fullWidth
                onClick={() => navigate('/login')}
              >
                Back to sign in
              </Button>
            </>
          )}

          {step !== 'sent' && (
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
