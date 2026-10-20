import type { ReactNode } from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { type ThemeColors, theme, useTheme } from './theme';

export type BadgeVariant = 'default' | 'secondary' | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  /** Applied to the label when `children` is a string. */
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  children: ReactNode;
}

function variantColors(variant: BadgeVariant, colors: ThemeColors) {
  switch (variant) {
    case 'default':
      return { background: colors.primary, border: colors.primary, text: colors.primaryForeground };
    case 'secondary':
      return { background: colors.muted, border: colors.muted, text: colors.foreground };
    case 'outline':
      return { background: 'transparent', border: colors.border, text: colors.foreground };
  }
}

/** Small pill for a status, count or tag. */
export function Badge({ variant = 'default', style, textStyle, testID, children }: BadgeProps) {
  const { colors } = useTheme();
  const tone = variantColors(variant, colors);

  return (
    <View
      testID={testID}
      style={[styles.badge, { backgroundColor: tone.background, borderColor: tone.border }, style]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: tone.text }, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
