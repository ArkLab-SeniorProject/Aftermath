import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import { useAuth } from '../auth/useAuth';
import { Loading } from '../components/molecules/loading/Loading';
import { AppLayout } from '../components/organisms/app-layout';

const NO_NAV_ROUTES = ['/', '/login', '/create-account', '/forgot-password', '/recovery/quiz', '/preparedness/quiz'];
const AUTH_ROUTES = ['/login', '/create-account', '/forgot-password'];

function isNoNavRoute(pathname: string) {
  if (NO_NAV_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/reset-password/')) return true;
  return false;
}

function hasCompletedQuiz(): boolean {
  try {
    return localStorage.getItem('recovery_quiz_complete') === 'true';
  } catch {
    return false;
  }
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutShell />
    </AuthProvider>
  );
}

function LayoutShell() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading text='Checking authentication...' />;
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname) || pathname.startsWith('/reset-password/');
  if (user && isAuthRoute) {
    return <Navigate to={hasCompletedQuiz() ? '/dashboard' : '/'} replace />;
  }

  const showNav = !isNoNavRoute(pathname) && hasCompletedQuiz();

  if (isNoNavRoute(pathname)) {
    return (
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    );
  }

  return (
    <AppLayout showNav={showNav}>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}
