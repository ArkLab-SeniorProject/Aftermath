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
import RecoveryHub from './pages/recovery/index';
import RecoveryQuiz from './pages/recovery/quiz';
import RecoveryResources from './pages/recovery/resources';
import PreparednessHub from './pages/preparedness/index';
import PreparednessQuiz from './pages/preparedness/quiz';
import PreparednessChecklist from './pages/preparedness/checklist';
import PreparednessResources from './pages/preparedness/resources';
import Dashboard from './pages/dashboard';
import Situation from './pages/situation';
import Profile from './pages/profile';
import StyleGuide from './pages/style-guide';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<RootLayout />}>
            <Route index element={<Landing />} />
            <Route path='recovery' element={<RecoveryHub />} />
            <Route path='recovery/quiz' element={<RecoveryQuiz />} />
            <Route path='recovery/resources' element={<RecoveryResources />} />
            <Route path='preparedness' element={<PreparednessHub />} />
            <Route path='preparedness/quiz' element={<PreparednessQuiz />} />
            <Route path='preparedness/checklist' element={<PreparednessChecklist />} />
            <Route path='preparedness/resources' element={<PreparednessResources />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='situation' element={<Situation />} />
            <Route path='profile' element={<Profile />} />
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
