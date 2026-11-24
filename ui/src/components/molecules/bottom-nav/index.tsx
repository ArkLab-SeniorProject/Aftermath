import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button } from '../../base-web';
import { AccountCircle, Assignment, Healing, Home, Shield } from '../../icons';

const NAV_ITEMS = [
  { label: 'My Situation', icon: <Assignment />, path: '/situation' },
  { label: 'Prepare', icon: <Shield />, path: '/preparedness' },
  { label: 'Home', icon: <Home />, path: '/dashboard' },
  { label: 'Recovery', icon: <Healing />, path: '/recovery' },
  { label: 'Profile', icon: <AccountCircle />, path: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.path;

  return (
    <Box
      component='nav'
      aria-label='Main navigation'
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: 'background.paper',
        borderTop: '1px solid #e0e0e0',
        borderRadius: '16px 16px 0 0',
        height: 64,
        px: 1,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.path}
          variant='text'
          onClick={() => navigate(item.path)}
          sx={{
            minWidth: 0,
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.25,
            color: currentPath === item.path ? '#1a1a1a' : '#6b6b6b',
            fontSize: '0.65rem',
            backgroundColor: 'transparent',
          }}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </Box>
  );
}

export default BottomNav;
