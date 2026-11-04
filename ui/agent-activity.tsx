import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Loader } from './loader';
import { useTheme } from './theme';

export type AgentActivityStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped';
export interface AgentActivityItem {
  id: string;
  title: string;
  description?: string;
  status: AgentActivityStatus;
  time?: string;
}
export interface AgentActivityProps {
  items: readonly AgentActivityItem[];
  title?: string;
  onRetry?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Ordered activity supplied by your app. This component never starts or performs agent work. */
export function AgentActivity({
  items,
  title = 'Agent activity',
  onRetry,
  style,
  testID,
}: AgentActivityProps) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={[styles.root, style]}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
        {title}
      </Text>
      {items.length === 0 && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          No activity yet.
        </Text>
      )}
      {items.map((item, index) => {
        const color =
          item.status === 'complete'
            ? colors.success
            : item.status === 'error'
              ? colors.danger
              : item.status === 'running'
                ? colors.primary
                : colors.mutedForeground;
        return (
          <View key={item.id} style={styles.row}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.rail}
            >
              <View
                style={[
                  styles.mark,
                  {
                    borderColor: item.status === 'pending' ? colors.border : color,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                {item.status === 'running' ? (
                  <Loader size={12} color={color} />
                ) : (
                  <Text style={{ color, fontSize: 11 }}>
                    {item.status === 'complete'
                      ? '✓'
                      : item.status === 'error'
                        ? '!'
                        : item.status === 'skipped'
                          ? '−'
                          : '·'}
                  </Text>
                )}
              </View>
              {index < items.length - 1 && (
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              )}
            </View>
            <View style={styles.copy}>
              <View style={styles.header}>
                <Text
                  accessibilityLabel={`${item.title}. ${item.status}`}
                  style={[styles.title, { color: colors.foreground }]}
                >
                  {item.title}
                </Text>
                {item.time && (
                  <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
                )}
              </View>
              {item.description && (
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                  {item.description}
                </Text>
              )}
              <Text style={[styles.state, { color }]}>
                {item.status === 'complete'
                  ? 'Complete'
                  : item.status === 'running'
                    ? 'In progress'
                    : item.status === 'error'
                      ? 'Needs attention'
                      : item.status === 'skipped'
                        ? 'Skipped'
                        : 'Queued'}
              </Text>
              {item.status === 'error' && onRetry && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Retry ${item.title}`}
                  onPress={() => onRetry(item.id)}
                  style={[styles.retry, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.foreground, fontSize: 12 }}>Retry step</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 4 },
  heading: { fontSize: 16, fontWeight: '600', marginBottom: 18 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { width: 24, alignItems: 'center' },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 1, minHeight: 24, marginVertical: 4 },
  copy: { flex: 1, minWidth: 0, gap: 5, paddingBottom: 24 },
  header: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  time: { fontSize: 10 },
  description: { fontSize: 11, lineHeight: 18 },
  state: { fontSize: 10, lineHeight: 16 },
  retry: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
  },
});
