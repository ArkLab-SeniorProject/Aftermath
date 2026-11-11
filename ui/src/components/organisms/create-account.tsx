import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { syncRecoverySituationIfNeeded } from '../../lib/sync-recovery-situation';
import { AuthCard } from './auth-card';

export function CreateAccountContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(() => {
    try {
      const stored = localStorage.getItem('recovery_quiz_answers');
      if (stored) {
        const answers = JSON.parse(stored);
        if (answers.name?.trim()) return answers.name.trim();
      }
    } catch {}
    return '';
  });
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');

  const handleAccessSubmit = () => {
    if (accessCode === import.meta.env.VITE_ACCESS_CODE) {
      setAccessGranted(true);
      setAccessError('');
    } else {
      setAccessError('Invalid access code');
    }
  };

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
    <AuthCard onBack={() => navigate('/')}>
      <Dialog open={!accessGranted} disableEscapeKeyDown>
        <DialogTitle>Access Code Required</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Account creation is currently limited to authorized testers. Please enter your access
            code to continue.
          </DialogContentText>
          {accessError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {accessError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Access Code"
            type="password"
            fullWidth
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAccessSubmit();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/login')}>Back to Login</Button>
          <Button onClick={handleAccessSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Create your account.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Get started with your recovery guide.
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
          First name:
        </Typography>
        <TextField
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 2 }}
        />

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
          disabled={auth.loading}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Username:
        </Typography>
        <TextField
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Password:
        </Typography>
        <TextField
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Confirm password:
        </Typography>
        <TextField
          placeholder="Re-enter your password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          disabled={auth.loading}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={auth.loading}
          sx={{ py: 1.75 }}
        >
          {auth.loading ? 'Creating account...' : 'Create account'}
        </Button>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 4 }}>
        Already have an account?{' '}
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
    </AuthCard>
  );
}

export default CreateAccountContent;
