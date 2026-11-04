import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Loader } from './loader';
import { theme, useTheme } from './theme';

export type ToolResultStatus = 'running' | 'success' | 'error';
export interface ToolResultProps {
  toolName: string;
  status: ToolResultStatus;
  summary?: string;
  output?: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onRetry?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Host-supplied tool status and selectable payload. It performs no requests itself. */
export function ToolResult({
  toolName,
  status,
  summary,
  output,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onRetry,
  disabled = false,
  style,
  testID,
}: ToolResultProps) {
  const { colors } = useTheme();
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const open = expanded ?? localExpanded;
  const tint =
    status === 'success'
      ? colors.success
      : status === 'error'
        ? colors.danger
        : colors.mutedForeground;
  const statusLabel =
    status === 'running' ? 'Running' : status === 'success' ? 'Completed' : 'Failed';
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={styles.header}>
        {status === 'running' ? (
          <Loader size={16} label={`${toolName} running`} />
        ) : (
          <Text style={{ color: tint, fontSize: 15 }}>{status === 'success' ? '✓' : '!'}</Text>
        )}
        <Text style={[styles.tool, { color: colors.foreground }]}>{toolName}</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: tint }]}>
          {statusLabel}
        </Text>
      </View>
      {summary && (
        <Text style={[styles.summary, { color: colors.mutedForeground }]}>{summary}</Text>
      )}
      {output !== undefined && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={() => {
            if (expanded === undefined) setLocalExpanded(!open);
            onExpandedChange?.(!open);
          }}
          testID={testID ? `${testID}-toggle` : undefined}
          style={[styles.toggle, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: '500' }}>
            {open ? 'Hide output' : 'Inspect output'}
          </Text>
          <Text style={{ color: colors.mutedForeground }}>{open ? '−' : '+'}</Text>
        </Pressable>
      )}
      {output !== undefined && open && (
        <ScrollView style={[styles.payload, { backgroundColor: colors.muted }]} nestedScrollEnabled>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <Text selectable style={[styles.code, { color: colors.foreground }]}>
              {output}
            </Text>
          </ScrollView>
        </ScrollView>
      )}
      {status === 'error' && onRetry && (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          accessibilityState={{ disabled }}
          onPress={onRetry}
          style={styles.retry}
        >
          <Text style={{ color: colors.foreground, fontSize: 12, textDecorationLine: 'underline' }}>
            Try again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tool: { flex: 1, fontSize: theme.fontSize.sm, fontWeight: '600' },
  status: { fontSize: 10 },
  summary: { fontSize: 12, lineHeight: 20 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  payload: { maxHeight: 220, borderRadius: 10 },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 11,
    lineHeight: 19,
    padding: 12,
  },
  retry: { minHeight: 32, justifyContent: 'center' },
});
