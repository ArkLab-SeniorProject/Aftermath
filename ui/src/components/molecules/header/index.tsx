import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '../../base-web';
import { Login } from '../../icons';

export interface HeaderProps {
  user?: Record<string, unknown>;
}

export function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const organization = user?.organization as Record<string, unknown> | undefined;
  const orgName = organization?.orgName ? String(organization.orgName).toUpperCase() : '';
  const userDisplayName = user
    ? String(user.firstName ?? '').trim() || String(user.username ?? '').trim() || 'User'
    : null;

  return (
    <Box
      component='header'
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 64,
        px: 3,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Box
        component='a'
        href='/'
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault();
          navigate('/');
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          color: 'text.primary',
          textDecoration: 'none',
        }}
      >
        <Typography variant='h6' component='span' fontWeight={600}>
          Senior Project
        </Typography>
        {orgName && (
          <Typography variant='body2' color='text.secondary'>
            {orgName}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        {userDisplayName ? (
          <Typography variant='body2'>{userDisplayName}</Typography>
        ) : (
          <Button
            variant='text'
            size='small'
            startIcon={<Login />}
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default Header;
