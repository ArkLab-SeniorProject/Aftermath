import { Box, Button, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

export default function LandingPage() {
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
      {/* Hero header */}
      <Box
        sx={{
          flexShrink: 0,
          height: { xs: '32vh', md: '40vh' },
          minHeight: { xs: 200, md: 300 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 3, md: 5 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: colors.black,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Aftermath
        </Typography>
      </Box>

      {/* Content card */}
      <Box
        sx={{
          position: 'relative',
          mt: { xs: -6, md: -8 },
          borderRadius: { xs: '24px 24px 0 0', md: '32px 32px 0 0' },
          bgcolor: 'background.paper',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: { md: 960, lg: 1100 },
          mx: 'auto',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            flex: 1,
            px: { xs: 3, sm: 4, md: 8 },
            pt: { xs: 4, md: 6 },
            pb: { xs: 3, md: 4 },
            gap: { md: 8 },
          }}
        >
          {/* Left column: text */}
          <Box sx={{ flex: { md: 1 }, maxWidth: { md: 520 } }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.4rem', md: '2.8rem' },
                lineHeight: 1.15,
                mb: { xs: 2.5, md: 3 },
                color: 'text.primary',
              }}
            >
              A clear path forward.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                mb: 1.5,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              After a natural disaster, figuring out what to do next can feel overwhelming
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                mb: { xs: 4, md: 5 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              Tell us a little about your situation, and we&rsquo;ll help you find your next step.
            </Typography>
          </Box>

          {/* Right column on desktop: buttons + footer */}
          <Box
            sx={{
              flex: { md: 1 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: { md: 'center' },
              maxWidth: { md: 440 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.75, fontSize: '0.95rem', mb: 1.5 }}
              onClick={() => navigate('/recovery/quiz')}
            >
              Create my recovery plan
            </Button>

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.75, fontSize: '0.95rem', mb: 3 }}
              onClick={() => navigate('/preparedness/quiz')}
            >
              Create my preparedness plan
            </Button>

            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                display: 'block',
                mb: 3,
                fontSize: '0.8rem',
              }}
            >
              Disclaimer: We do not collect or share your personal information.
            </Typography>
          </Box>
        </Box>

        {/* Footer links */}
        <Box
          sx={{
            textAlign: 'center',
            pb: { xs: 4, md: 5 },
            px: 3,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              underline="always"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              Sign in
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            Terms, privacy policy, and data use
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
