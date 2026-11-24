import { ApolloProvider } from '@apollo/client/react';
import { Route, Routes } from 'react-router-dom';

import { apolloClient } from './lib/apollo-client';

import RootLayout from './pages/_layout';
import CreateAccount from './pages/create-account';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgot-password';
import Landing from './pages/index';
import Login from './pages/login';
import NotFound from './pages/not-found';
import PreparednessChecklist from './pages/preparedness/checklist';
import PreparednessHub from './pages/preparedness/index';
import PreparednessQuiz from './pages/preparedness/quiz';
import PreparednessResources from './pages/preparedness/resources';
import Profile from './pages/profile';
import RecoveryHub from './pages/recovery/index';
import RecoveryQuiz from './pages/recovery/quiz';
import RecoveryResources from './pages/recovery/resources';
import ResetPassword from './pages/reset-password';
import Situation from './pages/situation';
import StyleGuide from './pages/style-guide';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
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
    </ApolloProvider>
  );
}
