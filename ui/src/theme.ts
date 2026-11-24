import { LightTheme, createTheme } from 'baseui';

export const CONTENT_MAX_WIDTH = 600;

export const colors = {
  black: '#1A1A1A',
  darkGray: '#3A3A3A',
  mediumGray: '#6B6B6B',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
  border: '#E0E0E0',
  heroGray: '#C8C8C8',
};

export const baseWebTheme = createTheme({
  colors: {
    ...LightTheme.colors,
    primary: colors.black,
    primaryA: colors.black,
    primaryB: colors.white,
    accent: colors.mediumGray,
  },
});
