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
import { useHostAction } from './ai-tool-utils';
import { theme, useTheme } from './theme';

export interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
  lineNumbers?: boolean;
  onAction?: (code: string) => void | Promise<void>;
  actionLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Selectable, horizontally scrollable code. An optional host action can copy, save, or insert it. */
export function CodeBlock({
  code,
  title = 'Code',
  language,
  lineNumbers = true,
  onAction,
  actionLabel = 'Use code',
  disabled = false,
  style,
  testID,
}: CodeBlockProps) {
  const { colors } = useTheme();
  const action = useHostAction(code);
  const lines = code.split(/\r?\n/);
  const locked = disabled || action.busy;
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {language && (
            <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{language}</Text>
          )}
        </View>
        {onAction && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            accessibilityState={{ disabled: locked, busy: action.busy }}
            disabled={locked}
            onPress={() => {
              if (!locked) void action.run(() => onAction(code));
            }}
            style={[styles.action, { backgroundColor: colors.muted }, locked && styles.dim]}
          >
            <Text style={{ color: colors.foreground, fontSize: 10 }}>
              {action.busy ? 'Please wait…' : actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.content}>
        {lineNumbers && (
          <Text
            accessible={false}
            importantForAccessibility="no"
            style={[styles.code, styles.numbers, { color: colors.mutedForeground }]}
          >
            {lines.map((_, index) => index + 1).join('\n')}
          </Text>
        )}
        <Text selectable style={[styles.code, { color: colors.foreground }]}>
          {code}
        </Text>
      </ScrollView>
      {action.error && (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
          {action.error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  title: { fontSize: 12, fontWeight: '500' },
  action: { minHeight: 30, paddingHorizontal: 10, justifyContent: 'center', borderRadius: 7 },
  content: { flexDirection: 'row', padding: 16, gap: 16 },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 11,
    lineHeight: 20,
  },
  numbers: { textAlign: 'right', minWidth: 12 },
  error: { fontSize: theme.fontSize.sm, padding: 14 },
  dim: { opacity: 0.5 },
});
