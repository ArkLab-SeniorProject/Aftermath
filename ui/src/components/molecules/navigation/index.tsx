import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { Box, Button, Divider } from '../../base-web';
import { Home, Login, Logout, Menu } from '../../icons';

export interface NavigationProps {
  onLogout?: () => void;
}

const navItems = [{ key: 'dashboard', label: 'Home', icon: <Home />, path: '/' }];

export function Navigation({ onLogout }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);
  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ height: 24 }} />
      <Divider />
      <Box sx={{ flex: 1, p: 1 }}>
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant='text'
            fullWidth
            startIcon={item.icon}
            onClick={() => {
              navigate(item.path);
              closeMenu();
            }}
            sx={{
              justifyContent: 'flex-start',
              backgroundColor: location.pathname === item.path ? '#f0f0f0' : 'transparent',
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {user ? (
          <Button fullWidth variant='outlined' startIcon={<Logout />} onClick={onLogout}>
            Sign out
          </Button>
        ) : (
          <Button
            fullWidth
            variant='outlined'
            startIcon={<Login />}
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Button
        aria-label='open navigation'
        variant='text'
        onClick={() => setMobileOpen((open) => !open)}
        startIcon={<Menu />}
        sx={{
          position: 'fixed',
          top: 12,
          right: 16,
          zIndex: 1100,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        Menu
      </Button>
      <Box component='nav' sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}>
        {mobileOpen && (
          <Box
            sx={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,.35)' }}
            onClick={closeMenu}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: 240,
                height: '100%',
                boxShadow: '0 8px 24px rgba(0,0,0,.2)',
              }}
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
              {drawerContent}
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: 240,
            borderRight: '1px solid #e0e0e0',
          }}
        >
          {drawerContent}
        </Box>
      </Box>
    </>
  );
}

export default Navigation;
