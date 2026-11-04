import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Message, MessageAvatar, MessageContent, MessageHeader, MessageMeta } from '../ui/message';
import { useTheme } from '../ui/theme';

export default function MessageDemo() {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / AI CHAT</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Make room for{'\n'}a good conversation.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A few thoughtful pieces. A message that feels like yours.
      </Text>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Message>
          <MessageAvatar label="Pocket Assistant" />
          <MessageContent>
            <MessageHeader>
              <Text style={[styles.author, { color: colors.foreground }]}>Pocket Assistant</Text>
              <MessageMeta>Just now</MessageMeta>
            </MessageHeader>
            <Text style={[styles.body, { color: colors.foreground }]}>
              Start with the small things. A clear heading, a little space, and a next step that
              makes sense.
            </Text>
            <View style={[styles.quote, { backgroundColor: colors.muted }]}>
              <Text style={[styles.body, { color: colors.foreground }]}>
                “Simple is a good place to begin.”
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: saved }}
              onPress={() => setSaved(!saved)}
              testID="message-save"
              style={styles.action}
            >
              <Text style={{ color: colors.success, fontSize: 12 }}>
                {saved ? '✓ Saved to your notes' : '＋ Save this thought'}
              </Text>
            </Pressable>
            <MessageMeta>Local sample conversation</MessageMeta>
          </MessageContent>
        </Message>
      </View>
      <Message from="user">
        <MessageAvatar label="You" />
        <MessageContent>
          <MessageHeader style={{ justifyContent: 'flex-end' }}>
            <MessageMeta>You · Now</MessageMeta>
          </MessageHeader>
          <Text style={[styles.body, { color: colors.foreground, textAlign: 'right' }]}>
            A little less noise. A little more meaning.
          </Text>
        </MessageContent>
      </Message>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 10, letterSpacing: 2 },
  title: { fontSize: 33, lineHeight: 39, letterSpacing: -1.2, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 22, padding: 18 },
  author: { fontSize: 12, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 22 },
  quote: { borderRadius: 12, padding: 14, marginVertical: 4 },
  action: { minHeight: 44, justifyContent: 'center' },
});
