import { Box } from '@mui/material';
import { useAuth } from '../../../auth/useAuth';
import { SignInBanner } from '../sign-in-banner';
import { CONTENT_MAX_WIDTH } from '../../../theme';

export interface PageContainerProps {
  children: React.ReactNode;
  showSignInBanner?: boolean;
}

export function PageContainer({ children, showSignInBanner = true }: PageContainerProps) {
  const { user } = useAuth();

  return (
    <>
      {showSignInBanner && !user && <SignInBanner />}
      <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto', px: 2, py: 3, width: '100%' }}>
        {children}
      </Box>
    </>
  );
}

export default PageContainer;
