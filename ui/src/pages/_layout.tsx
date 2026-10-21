import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
};

function AuthGate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    document.title = titles[pathname] ?? 'Senior Project';
  }, [pathname]);

  useEffect(() => {
    if (user && pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [pathname, user, navigate]);

  if (loading) {
    return <Loading text='Checking authentication...' />;
  }

  const isLoginRoute = pathname === '/login';

  if (isLoginRoute) {
    return <Outlet />;
  }

  return (
    <AppLayout user={user ?? undefined} onLogout={logout}>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}
