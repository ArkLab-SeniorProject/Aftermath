import { LogoutOutlined, PersonOutline } from '@mui/icons-material';
import { Avatar, Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { PageContainer } from '../components/molecules/page-container';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <PageContainer>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Profile
        </Typography>
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
          }}
        >
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'grey.300' }}>
            <PersonOutline sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant='body1' gutterBottom>
            You're not signed in.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Sign in to save your plan and access your profile.
          </Typography>
          <Button variant='contained' onClick={() => navigate('/login')} sx={{ mr: 1 }}>
            Sign in
          </Button>
          <Button variant='outlined' onClick={() => navigate('/create-account')}>
            Create account
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  const displayName = user.firstName?.trim() || user.username?.trim() || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <PageContainer showSignInBanner={false}>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              @{user.username}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <InfoRow label='Email' value={user.email || '—'} />
        <InfoRow label='Role' value={user.role} />
        {user.createdAt && (
          <InfoRow label='Member since' value={new Date(user.createdAt).toLocaleDateString()} />
        )}
      </Paper>

      <Button
        variant='outlined'
        color='error'
        startIcon={<LogoutOutlined />}
        fullWidth
        onClick={() => {
          logout();
          navigate('/', { replace: true });
        }}
      >
        Log out
      </Button>
    </PageContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2'>{value || '—'}</Typography>
    </Box>
  );
}
