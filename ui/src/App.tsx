import { ApolloProvider } from '@apollo/client/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import { apolloClient } from './lib/apollo-client';
import { theme } from './theme';

import RootLayout from './pages/_layout';
import Landing from './pages/index';
import Login from './pages/login';
import CreateAccount from './pages/create-account';
import ForgotPassword from './pages/forgot-password';
import NotFound from './pages/not-found';
import ResetPassword from './pages/reset-password';
import RecoveryQuiz from './pages/recovery/quiz';
import PreparednessQuiz from './pages/preparedness/quiz';
import Dashboard from './pages/dashboard';
import StyleGuide from './pages/style-guide';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<RootLayout />}>
            <Route index element={<Landing />} />
            <Route path='recovery/quiz' element={<RecoveryQuiz />} />
            <Route path='preparedness/quiz' element={<PreparednessQuiz />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='style-guide' element={<StyleGuide />} />
            <Route path='login' element={<Login />} />
            <Route path='create-account' element={<CreateAccount />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='reset-password/:token' element={<ResetPassword />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ApolloProvider>
  );
}
