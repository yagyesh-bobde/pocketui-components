import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageScroller } from '../ui/message-scroller';
import { useTheme } from '../ui/theme';

const samples = [
  'What makes a good place to begin?',
  'A little clarity. What would you like to make space for?',
  'More time for the things I keep putting off.',
  'Choose one small thing. Give it twenty minutes, without a second tab open.',
  'And when everything feels equally important?',
  'Write it down. Pick the thing that will make tomorrow feel lighter.',
  'That sounds manageable.',
  'Good. Start there, then take a break before deciding what comes next.',
  'A quieter pace, one step at a time.',
  'Exactly. There is room to get there without rushing.',
];

export default function MessageScrollerDemo() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [extra, setExtra] = useState(0);
  const [following, setFollowing] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => setExtra((count) => Math.min(count + 1, 10)), 4500);
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { borderBottomColor: colors.border, paddingTop: 24 + insets.top }]}
      >
        <Text style={[styles.eyebrow, { color: colors.success }]}>LOCAL SAMPLE CHAT</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Keep your place.</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
          {following ? 'Following the conversation' : 'Reading earlier messages'}
        </Text>
      </View>
      <MessageScroller testID="chat-history" onAtBottomChange={setFollowing}>
        {[
          ...samples,
          ...Array.from(
            { length: extra },
            (_, index) =>
              `A new sample thought, number ${index + 1}. Take your time; this conversation will wait.`,
          ),
        ].map((text, index) => (
          <View
            key={text}
            style={[
              styles.message,
              {
                alignSelf: index % 2 === 0 ? 'flex-end' : 'flex-start',
                backgroundColor: index % 2 === 0 ? colors.muted : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
              {index % 2 === 0 ? 'YOU' : 'POCKET ASSISTANT'}
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 22 }}>{text}</Text>
          </View>
        ))}
      </MessageScroller>
      <View
        style={[
          styles.footer,
          { borderTopColor: colors.border, paddingBottom: 16 + insets.bottom },
        ]}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 10, flex: 1 }}>
          Scroll up. New messages keep your place.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setExtra((count) => count + 1)}
          testID="chat-add-message"
          style={[styles.add, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.primaryForeground, fontSize: 12 }}>Add message</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0 },
  header: { padding: 24, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  eyebrow: { fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -0.8 },
  message: { maxWidth: '88%', borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  add: { minHeight: 44, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 14 },
});
