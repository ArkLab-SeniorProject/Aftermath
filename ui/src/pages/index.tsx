import { Box, Button, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function HeroBackground() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #D0D0D0 0%, #A0A0A0 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '140%',
          height: '140%',
          top: '-30%',
          left: '-20%',
          background: `
            radial-gradient(ellipse 50% 50% at 30% 60%, #3A3A3A 0%, transparent 70%),
            radial-gradient(ellipse 45% 45% at 70% 40%, #4A4A4A 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 50%, #2A2A2A 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 30%, #555555 0%, transparent 65%)
          `,
        }}
      />
      <Box
        component="svg"
        viewBox="0 0 400 300"
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.6,
        }}
      >
        <circle cx="120" cy="140" r="120" fill="#2A2A2A" />
        <circle cx="280" cy="100" r="100" fill="#3A3A3A" />
        <circle cx="200" cy="200" r="140" fill="#1A1A1A" opacity="0.5" />
        <ellipse cx="320" cy="220" rx="100" ry="80" fill="#444" opacity="0.4" />
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flexShrink: 0,
          // Mobile: shorter hero; Desktop: taller
          height: { xs: '38vh', sm: '42vh', md: '50vh' },
          minHeight: { xs: 240, md: 360 },
        }}
      >
        <HeroBackground />
        <Typography
          variant="h6"
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            pt: { xs: 2, md: 3 },
            color: '#1A1A1A',
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
          mt: { xs: -4, md: -6 },
          borderRadius: { xs: '24px 24px 0 0', md: '32px 32px 0 0' },
          bgcolor: 'background.paper',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // Desktop: constrain width and center
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
