import { Login } from '@mui/icons-material';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  user?: Record<string, unknown>;
}

export function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const organization = user?.organization as Record<string, unknown> | undefined;
  const orgName = organization?.orgName ? String(organization.orgName).toUpperCase() : '';
  const userDisplayName = user ? String(user.firstName ?? user.username ?? 'User') : null;

  return (
    <AppBar position='static' elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box
          component='a'
          href='/'
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Typography variant='h6' component='div' fontWeight={600}>
            Senior Project
          </Typography>
          {orgName && (
            <Typography variant='body2' color='inherit' sx={{ opacity: 0.8 }}>
              {orgName}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {userDisplayName ? (
            <Typography variant='body2' color='inherit'>
              {userDisplayName}
            </Typography>
          ) : (
            <Button
              color='inherit'
              size='small'
              startIcon={<Login />}
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
