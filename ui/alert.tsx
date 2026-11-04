import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { theme, useTheme } from './theme';

export type AlertVariant = 'default' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title: string;
  description?: string;
  variant?: AlertVariant;
  icon?: ReactNode;
  action?: { label: string; onPress: () => void; disabled?: boolean };
  /** The parent removes the alert when this callback runs. */
  onDismiss?: () => void;
  dismissLabel?: string;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Inline feedback with an optional action and explicit dismissal. No timeout or global store. */
export function Alert({
  title,
  description,
  variant = 'default',
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss alert',
  animate = true,
  style,
  testID,
}: AlertProps) {
  const { colors } = useTheme();
  const accent =
    variant === 'success'
      ? colors.success
      : variant === 'warning'
        ? colors.warning
        : variant === 'error'
          ? colors.danger
          : colors.foreground;
  const symbol =
    variant === 'success' ? '✓' : variant === 'warning' ? '!' : variant === 'error' ? '×' : 'i';
  return (
    <Animated.View
      entering={animate ? FadeInDown.duration(180).reduceMotion(ReduceMotion.System) : undefined}
      exiting={animate ? FadeOut.duration(140).reduceMotion(ReduceMotion.System) : undefined}
      testID={testID}
      style={[
        styles.alert,
        { backgroundColor: colors.card, borderColor: colors.border, borderStartColor: accent },
        style,
      ]}
    >
      <View style={styles.row}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.icon, { borderColor: accent }]}
        >
          {icon ?? <Text style={[styles.symbol, { color: accent }]}>{symbol}</Text>}
        </View>
        <View style={styles.content}>
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion={variant === 'error' ? 'assertive' : 'polite'}
            style={[styles.title, { color: colors.foreground }]}
          >
            {title}
          </Text>
          {description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          ) : null}
          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: action.disabled ?? false }}
              disabled={action.disabled}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.action,
                { borderColor: colors.border },
                (pressed || action.disabled) && styles.dim,
              ]}
            >
              <Text style={[styles.actionText, { color: colors.foreground }]}>{action.label}</Text>
            </Pressable>
          ) : null}
        </View>
        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dismissLabel}
            onPress={onDismiss}
            style={({ pressed }) => [styles.close, pressed && styles.dim]}
          >
            <Text style={[styles.closeText, { color: colors.mutedForeground }]}>×</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  alert: {
    borderWidth: 1,
    borderStartWidth: 3,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  icon: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontSize: 14, fontWeight: theme.fontWeight.bold, lineHeight: 18 },
  content: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  title: { fontSize: theme.fontSize.sm, lineHeight: 22, fontWeight: theme.fontWeight.semibold },
  description: { fontSize: 13, lineHeight: 20 },
  action: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
  },
  actionText: { fontSize: 13, fontWeight: theme.fontWeight.semibold },
  close: {
    width: 44,
    minHeight: 44,
    marginEnd: -theme.spacing.md,
    marginTop: -theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 24, lineHeight: 28 },
  dim: { opacity: 0.5 },
});
