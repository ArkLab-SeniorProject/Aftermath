import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { BottomNav } from '../../molecules/bottom-nav';

export interface AppLayoutProps {
  showNav: boolean;
  children: React.ReactNode;
}

export function AppLayout({ showNav, children }: AppLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dependency is intentional (route change scroll reset)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: showNav ? '72px' : 0,
        }}
      >
        {children}
      </Box>
      {showNav && <BottomNav />}
    </Box>
  );
}

export default AppLayout;
