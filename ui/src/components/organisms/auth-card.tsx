import { ArrowBack, Close } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme';

export function AuthCard({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.heroGray,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: { xs: '14vh', md: '18vh' },
          minHeight: { xs: 100, md: 140 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 2, md: 4 },
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: colors.black, fontWeight: 700, letterSpacing: '0.02em' }}
        >
          Aftermath
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          mt: { xs: -3, md: -4 },
          borderRadius: { xs: '24px 24px 0 0', md: '32px 32px 0 0' },
          bgcolor: 'background.paper',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: { md: 720, lg: 800 },
          mx: 'auto',
          width: '100%',
          boxShadow: { md: '0 -4px 24px rgba(0,0,0,0.08)' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            pt: { xs: 2.5, md: 3 },
            pb: 1,
          }}
        >
          <IconButton
            onClick={onBack ?? (() => navigate(-1))}
            size="small"
            aria-label="back"
          >
            <ArrowBack />
          </IconButton>
          <IconButton onClick={() => navigate('/')} size="small" aria-label="close">
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 3, md: 5 },
            pb: { xs: 3, md: 4 },
          }}
        >
          {children}
        </Box>

        <Box sx={{ textAlign: 'center', pb: { xs: 4, md: 5 }, px: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            Terms, privacy policy, and data use
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
