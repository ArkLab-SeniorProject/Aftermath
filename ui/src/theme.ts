import { createTheme } from '@mui/material/styles';

export const CONTENT_MAX_WIDTH = 600;

export const colors = {
  black: '#1A1A1A',
  darkGray: '#3A3A3A',
  mediumGray: '#6B6B6B',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
  border: '#E0E0E0',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.black,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.mediumGray,
      contrastText: colors.white,
    },
    background: {
      default: colors.lightGray,
      paper: colors.white,
    },
    text: {
      primary: colors.black,
      secondary: colors.mediumGray,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '12px 24px',
          fontSize: '0.95rem',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: colors.black,
          color: colors.black,
          '&:hover': {
            borderColor: colors.black,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});
