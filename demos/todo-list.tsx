import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ui/theme';
import { type TodoItem, TodoList } from '../ui/todo-list';

const initial: readonly TodoItem[] = [
  {
    id: 'outline',
    label: 'Find the shape of the idea',
    detail: 'A clear starting point.',
    status: 'completed',
  },
  {
    id: 'draft',
    label: 'Write a first draft',
    detail: 'Keep it simple. Keep it moving.',
    status: 'in-progress',
  },
  { id: 'review', label: 'Give the details a little care', status: 'pending' },
  {
    id: 'share',
    label: 'Share it with the team',
    detail: 'Waiting for a connected workspace.',
    status: 'blocked',
  },
];

export default function TodoListDemo() {
  const { colors } = useTheme();
  const [items, setItems] = useState(initial);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / SAMPLE TASKS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        A few small steps.{'\n'}Something taking shape.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Make progress visible. Keep the next thing within reach.
      </Text>
      <TodoList
        title="Bring an idea to life"
        items={items}
        onToggle={(id) =>
          setItems((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
                : item,
            ),
          )
        }
        testID="sample-todos"
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setItems(initial)}
        testID="todo-reset"
        style={[styles.reset, { backgroundColor: colors.muted }]}
      >
        <Text style={{ color: colors.foreground, fontSize: 12 }}>Start the sample again ↗</Text>
      </Pressable>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Tap a task to request a change. Blocked work stays put until your app is ready.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 30, lineHeight: 37, letterSpacing: -1, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  reset: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  note: { fontSize: 11, lineHeight: 19 },
});
