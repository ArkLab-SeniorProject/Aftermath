import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import { useAuth } from '../auth/useAuth';
import { Loading } from '../components/molecules/loading/Loading';
import { AppLayout } from '../components/organisms/app-layout';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const titles: Record<string, string> = {
  '/': 'Home | Senior Project',
  '/login': 'Login | Senior Project',
  '/create-account': 'Create Account | Senior Project',
  '/forgot-password': 'Forgot Password | Senior Project',
};

function AuthGate() {
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    document.title = titles[pathname] ?? 'Senior Project';
  }, [pathname]);

  const isAuthRoute =
    pathname === '/login' || pathname === '/create-account' || pathname === '/forgot-password';

  if (isAuthRoute) {
    return <Outlet />;
  }

  if (loading) {
    return <Loading text='Checking authentication...' />;
  }

  return (
    <AppLayout user={user ?? undefined} onLogout={logout}>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}
