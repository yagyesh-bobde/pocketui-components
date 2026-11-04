import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useHostAction } from './ai-tool-utils';
import { theme, useTheme } from './theme';

export type ToolApprovalStatus = 'pending' | 'submitting' | 'approved' | 'rejected';
export interface ToolApprovalProps {
  requestId: string;
  title: string;
  description?: string;
  toolName?: string;
  status: ToolApprovalStatus;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  disabled?: boolean;
  destructive?: boolean;
  error?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Explicit host-owned approval. Presses request a decision; they never execute a tool. */
export function ToolApproval({
  requestId,
  title,
  description,
  toolName,
  status,
  onApprove,
  onReject,
  disabled = false,
  destructive = false,
  error,
  children,
  style,
  testID,
}: ToolApprovalProps) {
  const { colors } = useTheme();
  const action = useHostAction(requestId);
  const busy = status === 'submitting' || action.busy;
  const locked = disabled || status !== 'pending' || busy;
  const statusLabel =
    status === 'approved'
      ? 'Approved'
      : status === 'rejected'
        ? 'Declined'
        : busy
          ? 'Waiting for confirmation'
          : 'Approval required';
  const statusColor =
    status === 'approved'
      ? colors.success
      : status === 'rejected'
        ? colors.mutedForeground
        : destructive
          ? colors.danger
          : colors.foreground;
  const message = error ?? action.error;
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={styles.topline}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor }]}>
          {statusLabel}
        </Text>
        {toolName && (
          <Text style={[styles.tool, { color: colors.mutedForeground }]}>{toolName}</Text>
        )}
      </View>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      )}
      {children}
      {message && (
        <Text accessibilityRole="alert" style={[styles.description, { color: colors.danger }]}>
          {message}
        </Text>
      )}
      {(status === 'pending' || status === 'submitting') && (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decline action"
            accessibilityState={{ disabled: locked, busy }}
            disabled={locked}
            testID={testID ? `${testID}-reject` : undefined}
            onPress={() => {
              if (!locked) void action.run(onReject);
            }}
            style={({ pressed }) => [
              styles.button,
              { borderColor: colors.border, backgroundColor: colors.card },
              (locked || pressed) && styles.dim,
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.foreground }]}>Decline</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Approve action"
            accessibilityState={{ disabled: locked, busy }}
            disabled={locked}
            testID={testID ? `${testID}-approve` : undefined}
            onPress={() => {
              if (!locked) void action.run(onApprove);
            }}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: destructive ? colors.danger : colors.primary,
                borderColor: destructive ? colors.danger : colors.primary,
              },
              (locked || pressed) && styles.dim,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: destructive ? colors.dangerForeground : colors.primaryForeground },
              ]}
            >
              {busy ? 'Please wait…' : 'Approve'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderWidth: 1, borderRadius: 20, gap: 12 },
  topline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  status: { fontSize: 11, fontWeight: '600' },
  tool: { fontSize: 10, marginLeft: 'auto' },
  title: { fontSize: theme.fontSize.md, fontWeight: '600', letterSpacing: -0.3 },
  description: { fontSize: 12, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  button: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonText: { fontSize: 12, fontWeight: '600' },
  dim: { opacity: 0.5 },
});
