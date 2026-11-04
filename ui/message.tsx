import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextProps, View, type ViewProps } from 'react-native';
import { theme, useTheme } from './theme';

export type MessageRole = 'user' | 'assistant' | 'system';
export interface MessageProps extends ViewProps {
  from?: MessageRole;
}

/** A composable message row. The host owns message data and transport. */
export function Message({ from = 'assistant', style, children, ...props }: MessageProps) {
  return (
    <View {...props} style={[styles.row, from === 'user' && styles.user, style]}>
      {children}
    </View>
  );
}

export function MessageAvatar({
  label,
  children,
  style,
  ...props
}: ViewProps & { label: string; children?: ReactNode }) {
  const { colors } = useTheme();
  const initials = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
  return (
    <View
      {...props}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.avatar, { backgroundColor: colors.muted, borderColor: colors.border }, style]}
    >
      {children ?? (
        <Text style={[styles.initials, { color: colors.foreground }]}>{initials || '?'}</Text>
      )}
    </View>
  );
}

export function MessageContent({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.content, style]} />;
}

export function MessageHeader({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.header, style]} />;
}

export function MessageMeta({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[styles.meta, { color: colors.mutedForeground }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%' },
  user: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 10, fontWeight: theme.fontWeight.semibold },
  content: { flex: 1, minWidth: 0, gap: 8 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  meta: { fontSize: 11, lineHeight: 17 },
});
