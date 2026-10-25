import { type TextStyle, useColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

type ColorToken =
  | 'background'
  | 'foreground'
  | 'card'
  | 'muted'
  | 'mutedForeground'
  | 'border'
  | 'primary'
  | 'primaryForeground'
  | 'success'
  | 'successForeground'
  | 'successSurface'
  | 'danger'
  | 'dangerForeground'
  | 'warning'
  | 'warningForeground';

export type ThemeColors = Readonly<Record<ColorToken, string>>;

type Scale<TKey extends string> = Readonly<Record<TKey, number>>;

interface Theme {
  readonly light: ThemeColors;
  readonly dark: ThemeColors;
  readonly spacing: Scale<'xs' | 'sm' | 'md' | 'lg' | 'xl'>;
  readonly radius: Scale<'sm' | 'md' | 'lg'>;
  readonly fontSize: Scale<'sm' | 'md' | 'lg' | 'title' | 'heading' | 'display'>;
  readonly fontWeight: Readonly<
    Record<'regular' | 'medium' | 'semibold' | 'bold', NonNullable<TextStyle['fontWeight']>>
  >;
}

export const theme = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    success: '#047a4a',
    successForeground: '#ffffff',
    successSurface: '#e8f7ef',
    danger: '#dc2626',
    dangerForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#09090b',
  },
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#18181b',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
    primary: '#fafafa',
    primaryForeground: '#18181b',
    success: '#06c270',
    successForeground: '#09090b',
    successSurface: '#0b2a1c',
    danger: '#f87171',
    dangerForeground: '#09090b',
    warning: '#fbbf24',
    warningForeground: '#09090b',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radius: { sm: 4, md: 8, lg: 12 },
  fontSize: { sm: 14, md: 16, lg: 18, title: 20, heading: 28, display: 48 },
  fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const satisfies Theme;

export interface ThemeValue {
  readonly scheme: ColorScheme;
  readonly colors: ThemeColors;
  readonly spacing: typeof theme.spacing;
  readonly radius: typeof theme.radius;
  readonly fontSize: typeof theme.fontSize;
  readonly fontWeight: typeof theme.fontWeight;
}

const { light, dark, ...tokens } = theme;

const values: Readonly<Record<ColorScheme, ThemeValue>> = {
  light: { scheme: 'light', colors: light, ...tokens },
  dark: { scheme: 'dark', colors: dark, ...tokens },
};

/** Theme for the current system color scheme. The returned object is stable per scheme. */
export function useTheme(): ThemeValue {
  return values[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
