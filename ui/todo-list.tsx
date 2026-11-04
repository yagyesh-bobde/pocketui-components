import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { type TodoStatus, todoProgress } from './chat-state';
import { useTheme } from './theme';

export type { TodoStatus } from './chat-state';
export interface TodoItem {
  id: string;
  label: string;
  detail?: string;
  status: TodoStatus;
}
export interface TodoListProps {
  items: readonly TodoItem[];
  title?: string;
  onToggle?: (id: string) => void;
  disabled?: boolean;
  showProgress?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Host-controlled tasks. Toggle requests identify a task; the host chooses its next status. */
export function TodoList({
  items,
  title = 'Tasks',
  onToggle,
  disabled = false,
  showProgress = true,
  style,
  testID,
}: TodoListProps) {
  const { colors } = useTheme();
  const progress = todoProgress(items);
  return (
    <View
      testID={testID}
      style={[styles.root, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {progress.completed}/{progress.total}
        </Text>
      </View>
      {showProgress && (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`${title} progress`}
          accessibilityValue={{
            min: 0,
            max: progress.total || 1,
            now: progress.completed,
            text: `${progress.completed} of ${progress.total} complete`,
          }}
          style={[styles.track, { backgroundColor: colors.muted }]}
        >
          <View
            style={[
              styles.fill,
              { width: `${progress.percent}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      )}
      {items.length === 0 && (
        <Text style={[styles.detail, { color: colors.mutedForeground }]}>No tasks yet.</Text>
      )}
      {items.map((item) => {
        const checked = item.status === 'completed';
        const blocked = disabled || !onToggle || item.status === 'blocked';
        const state = checked
          ? 'Complete'
          : item.status === 'in-progress'
            ? 'In progress'
            : item.status === 'blocked'
              ? 'Blocked'
              : 'Pending';
        return (
          <Pressable
            key={item.id}
            accessibilityRole="checkbox"
            accessibilityLabel={`${item.label}. ${state}${item.detail ? `. ${item.detail}` : ''}`}
            accessibilityState={{ checked, disabled: blocked, busy: item.status === 'in-progress' }}
            disabled={blocked}
            onPress={() => onToggle?.(item.id)}
            testID={testID ? `${testID}-${item.id}` : undefined}
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: 0.65 },
              disabled && { opacity: 0.5 },
            ]}
          >
            <View
              accessible={false}
              style={[
                styles.check,
                {
                  borderColor: checked ? colors.primary : colors.border,
                  backgroundColor: checked ? colors.primary : colors.background,
                },
              ]}
            >
              <Text
                style={{
                  color: checked ? colors.primaryForeground : colors.mutedForeground,
                  fontSize: 12,
                }}
              >
                {checked
                  ? '✓'
                  : item.status === 'blocked'
                    ? '!'
                    : item.status === 'in-progress'
                      ? '·'
                      : ''}
              </Text>
            </View>
            <View style={styles.copy}>
              <Text
                style={[
                  styles.label,
                  checked && styles.strike,
                  { color: checked ? colors.mutedForeground : colors.foreground },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.detail,
                  { color: item.status === 'blocked' ? colors.danger : colors.mutedForeground },
                ]}
              >
                {item.detail ?? state}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20, gap: 16, borderWidth: 1, borderRadius: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '600' },
  count: { fontSize: 12, fontVariant: ['tabular-nums'] },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  check: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 5 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  strike: { textDecorationLine: 'line-through' },
  detail: { fontSize: 11, lineHeight: 18 },
});
