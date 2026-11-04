import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageBubble } from '../ui/message-bubble';
import { useTheme } from '../ui/theme';

export default function MessageBubbleDemo() {
  const { colors } = useTheme();
  const [helpful, setHelpful] = useState(false);
  const body = [styles.body, { color: colors.foreground }];
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / LOCAL CONVERSATION</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        A back-and-forth.{'\n'}With a little warmth.
      </Text>
      <MessageBubble from="user" time="10:42">
        <Text style={body}>Help me find a quieter rhythm for the day.</Text>
      </MessageBubble>
      <MessageBubble
        name="Pocket Assistant"
        time="10:42"
        footer={
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: helpful }}
            onPress={() => setHelpful(!helpful)}
            testID="bubble-helpful"
            style={styles.action}
          >
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
              {helpful ? '✓ Marked helpful' : '♡ That was helpful'}
            </Text>
          </Pressable>
        }
      >
        <Text style={body}>Keep one thing at a time in focus.</Text>
        <Text style={body}>
          A short walk. A clear desk. Five minutes before the next thing begins.
        </Text>
      </MessageBubble>
      <MessageBubble from="system" showAvatar={false} name="Conversation note">
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Sample content, ready to replace with your own messages.
        </Text>
      </MessageBubble>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 26 },
  eyebrow: { fontSize: 9, letterSpacing: 1.6 },
  title: { fontSize: 31, lineHeight: 38, letterSpacing: -1, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 22 },
  note: { fontSize: 12, lineHeight: 20 },
  action: { minHeight: 44, justifyContent: 'center' },
});
