import { AccountCircle, Assignment, Healing, Home, Shield } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const currentIndex = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderRadius: '16px 16px 0 0',
      }}
    >
      <BottomNavigation
        value={currentIndex === -1 ? 2 : currentIndex}
        onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
        showLabels
        sx={{
          borderRadius: '16px 16px 0 0',
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            py: 1,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            '&.Mui-selected': { fontSize: '0.65rem' },
          },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
