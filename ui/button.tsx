import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { type ThemeColors, theme, useTheme } from './theme';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  /** Applied to the label when `children` is a string. */
  textStyle?: StyleProp<TextStyle>;
  children: ReactNode;
}

function variantColors(variant: ButtonVariant, colors: ThemeColors) {
  switch (variant) {
    case 'default':
      return { background: colors.primary, border: colors.primary, text: colors.primaryForeground };
    case 'secondary':
      return { background: colors.muted, border: colors.muted, text: colors.foreground };
    case 'outline':
      return { background: 'transparent', border: colors.border, text: colors.foreground };
    case 'ghost':
      return { background: 'transparent', border: 'transparent', text: colors.foreground };
  }
}

/** Pressable with a text or custom label. Dims while pressed and when disabled. */
export function Button({
  variant = 'default',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  children,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const tone = variantColors(variant, colors);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, textSizeStyles[size], { color: tone.text }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
  },
});

const sizeStyles = StyleSheet.create({
  sm: { height: 32, paddingHorizontal: theme.spacing.md },
  md: { height: 40, paddingHorizontal: theme.spacing.lg },
  lg: { height: 48, paddingHorizontal: theme.spacing.xl },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: theme.fontSize.sm },
  lg: { fontSize: theme.fontSize.md },
});
