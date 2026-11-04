import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from 'react-native';
import { theme, useTheme } from './theme';

export interface CardProps extends ViewProps {
  variant?: 'outline' | 'filled';
  onPress?: PressableProps['onPress'];
  selected?: boolean;
  disabled?: boolean;
}

/** Composable surface; providing onPress turns the whole card into one button. */
export function Card({
  variant = 'outline',
  onPress,
  selected = false,
  disabled = false,
  style,
  accessibilityState,
  ...props
}: CardProps) {
  const { colors } = useTheme();
  const surface = [
    styles.card,
    {
      backgroundColor: variant === 'filled' ? colors.muted : colors.card,
      borderColor: selected ? colors.primary : colors.border,
    },
    disabled && styles.disabled,
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        {...props}
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [surface, pressed && styles.pressed]}
      />
    );
  }
  return <View {...props} accessibilityState={accessibilityState} style={surface} />;
}

export function CardHeader({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.header, style]} />;
}

export function CardTitle({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[styles.title, { color: colors.foreground }, style]} />;
}

export function CardDescription({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[styles.description, { color: colors.mutedForeground }, style]} />;
}

export function CardContent({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.content, style]} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.footer, style]} />;
}

/** Place alongside the heading content inside a CardHeader. */
export function CardAction({ children, style, ...props }: ViewProps & { children?: ReactNode }) {
  return (
    <View {...props} style={[styles.action, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: theme.radius.lg + 4,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: { gap: theme.spacing.xs },
  title: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold },
  description: { fontSize: theme.fontSize.sm, lineHeight: 21 },
  content: { gap: theme.spacing.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  action: { alignSelf: 'flex-start', marginTop: theme.spacing.sm },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
});
