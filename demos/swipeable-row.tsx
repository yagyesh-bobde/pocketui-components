import { useState } from 'react';
import { Text, View } from 'react-native';
import { SwipeableRow } from '../ui/swipeable-row';
import { useTheme } from '../ui/theme';
import { DemoButton, demoStyles, EssentialsDemo } from './essentials-demo';

const notes = [
  {
    id: 'morning',
    title: 'A slower morning',
    detail: 'Ideas worth coming back to.',
    initials: 'AM',
  },
  {
    id: 'weekend',
    title: 'Weekend plans',
    detail: 'A few things to look forward to.',
    initials: 'WP',
  },
  {
    id: 'reading',
    title: 'The reading list',
    detail: 'One good chapter at a time.',
    initials: 'RL',
  },
];
export default function SwipeableRowDemo() {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState<string[]>([]);
  const [opened, setOpened] = useState<string | null>(null);
  const [status, setStatus] = useState('Swipe left, or tap the dots for actions.');
  return (
    <EssentialsDemo
      title="Swipeable Row"
      description="Keep the list simple. Reveal the actions when you need them, with a tap before anything disappears."
    >
      <View style={demoStyles.section}>
        {notes
          .filter((note) => !hidden.includes(note.id))
          .map((note) => (
            <SwipeableRow
              key={note.id}
              testID={`row-${note.id}`}
              accessibilityLabel={`${note.title}. ${note.detail}`}
              open={opened === note.id}
              onOpenChange={(open) => setOpened(open ? note.id : null)}
              actions={[
                {
                  key: 'archive',
                  label: 'Archive',
                  onPress: () => {
                    setStatus(`${note.title} archived.`);
                    setHidden((current) => [...current, note.id]);
                  },
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => {
                    setStatus(`${note.title} deleted.`);
                    setHidden((current) => [...current, note.id]);
                  },
                },
              ]}
            >
              <View style={demoStyles.row}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    backgroundColor: colors.muted,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>
                    {note.initials}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                    {note.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{note.detail}</Text>
                </View>
              </View>
            </SwipeableRow>
          ))}
      </View>
      <View
        style={[demoStyles.card, { backgroundColor: colors.muted, borderColor: colors.border }]}
      >
        <Text testID="swipe-status" style={[demoStyles.text, { color: colors.mutedForeground }]}>
          {status}
        </Text>
      </View>
      <DemoButton
        testID="rows-reset"
        onPress={() => {
          setHidden([]);
          setOpened(null);
          setStatus('Swipe left, or tap the dots for actions.');
        }}
      >
        Restore notes
      </DemoButton>
      <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
        Vertical scrolling stays yours. No automatic delete on a full swipe.
      </Text>
    </EssentialsDemo>
  );
}
