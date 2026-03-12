import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#97C7BD',
  primaryDark: '#7AADA2',
  primaryLight: '#E8F3F0',
  primaryGradientStart: '#29282B',
  primaryGradientEnd: '#97C7BD',

  accent: '#C4897A',
  accentLight: '#F5EBE8',

  highlight: '#D4B896',
  highlightLight: '#F5EFE6',

  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  darkSurface: '#29282B',

  textPrimary: '#29282B',
  textSecondary: '#8F9795',
  textMuted: '#9C9B9F',
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  border: '#D2D1D4',
  borderLight: '#E9E8EA',

  success: '#12B76A',
  successLight: '#ECFDF3',
  error: '#F04438',
  errorLight: '#FEF3F2',
  warning: '#F79009',
  warningLight: '#FFFAEB',

  white: '#FFFFFF',
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.accentLight,
    tertiary: colors.highlight,
    tertiaryContainer: colors.highlightLight,
    surface: colors.surface,
    surfaceVariant: colors.borderLight,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.errorLight,
    onPrimary: colors.white,
    onPrimaryContainer: colors.primaryDark,
    onSecondary: colors.white,
    onSecondaryContainer: colors.accent,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.textPrimary,
    onError: colors.white,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  roundness: 5,
};
