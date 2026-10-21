import { Home, Login, Logout, Menu } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';

export interface NavigationProps {
  onLogout?: () => void;
}

const DRAWER_WIDTH = 240;

const navItems = [{ key: 'dashboard', label: 'Home', icon: <Home />, path: '/' }];

export function Navigation({ onLogout }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => setMobileOpen((open) => !open);
  const handleClose = () => setMobileOpen(false);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Divider />
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                handleClose();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {user ? (
          <Button
            fullWidth
            variant='outlined'
            color='inherit'
            startIcon={<Logout />}
            onClick={onLogout}
          >
            Sign out
          </Button>
        ) : (
          <Button
            fullWidth
            variant='outlined'
            color='inherit'
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
      <IconButton
        color='inherit'
        aria-label='open navigation'
        edge='start'
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          top: 12,
          right: 16,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          display: { md: 'none' },
        }}
      >
        <Menu />
      </IconButton>

      <Box component='nav' sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant='permanent'
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}

export default Navigation;
