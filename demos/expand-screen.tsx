import { type ComponentRef, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpandScreen, type ExpandScreenOrigin } from '../ui/expand-screen';
import { useTheme } from '../ui/theme';

const people = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    initials: 'AR',
    topic: 'A fresh perspective',
    preview: 'There might be another way to look at it.',
    time: 'now',
  },
  {
    id: 'jamie',
    name: 'Jamie Chen',
    initials: 'JC',
    topic: 'Make room for possibility',
    preview: 'One small step is a good place to start.',
    time: '12m',
  },
  {
    id: 'sam',
    name: 'Sam Ellis',
    initials: 'SE',
    topic: 'Find your own pace',
    preview: 'Good things do not always need a deadline.',
    time: '1h',
  },
];
type Person = (typeof people)[number];

function ChatRow({
  person,
  onOpen,
}: {
  person: Person;
  onOpen: (person: Person, origin: ExpandScreenOrigin) => void;
}) {
  const { colors } = useTheme();
  const ref = useRef<ComponentRef<typeof View>>(null);
  return (
    <Pressable
      ref={ref}
      testID={`expand-chat-${person.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${person.name}`}
      onPress={() =>
        ref.current?.measureInWindow((x, y, width, height) =>
          onOpen(person, { x, y, width, height, radius: 24 }),
        )
      }
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.successSurface }]}>
        <Text style={[styles.initials, { color: colors.mint }]}>{person.initials}</Text>
        <View
          style={[styles.online, { backgroundColor: colors.success, borderColor: colors.card }]}
        />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, { color: colors.foreground }]}>{person.name}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{person.time}</Text>
        </View>
        <Text style={[styles.topic, { color: colors.mutedForeground }]}>{person.topic}</Text>
        <Text numberOfLines={1} style={[styles.preview, { color: colors.mutedForeground }]}>
          {person.preview}
        </Text>
      </View>
    </Pressable>
  );
}

function Conversation({ person, close }: { person: Person; close: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const nextMessage = useRef(0);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const send = () => {
    const message = draft.trim();
    if (!message) return;
    const id = nextMessage.current++;
    setMessages((current) => [...current, { id, text: message }]);
    setDraft('');
  };
  return (
    <KeyboardAvoidingView
      style={[styles.conversation, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[styles.chatHeader, { paddingTop: insets.top + 12, borderColor: colors.border }]}
      >
        <Pressable
          testID="expand-chat-back"
          accessibilityRole="button"
          accessibilityLabel="Back to conversations"
          onPress={close}
          style={[styles.back, { backgroundColor: colors.muted }]}
        >
          <Text style={[styles.backMark, { color: colors.foreground }]}>‹</Text>
        </Pressable>
        <View style={styles.rowCopy}>
          <Text testID="expand-chat-name" style={[styles.name, { color: colors.foreground }]}>
            {person.name}
          </Text>
          <Text style={[styles.topic, { color: colors.success }]}>
            Here for a good conversation
          </Text>
        </View>
        <View style={[styles.smallAvatar, { backgroundColor: colors.successSurface }]}>
          <Text style={[styles.initials, { color: colors.mint }]}>{person.initials}</Text>
        </View>
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        <Text style={[styles.today, { color: colors.mutedForeground }]}>
          TODAY · A NEW CONVERSATION
        </Text>
        <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
          <Text style={[styles.messageText, { color: colors.foreground }]}>
            Hi there. What’s on your mind?
          </Text>
          <Text style={[styles.messageTime, { color: colors.mutedForeground }]}>10:41</Text>
        </View>
        <View style={[styles.bubble, styles.outgoing, { backgroundColor: colors.primary }]}>
          <Text style={[styles.messageText, { color: colors.primaryForeground }]}>
            I have a few ideas. I’m figuring out where to begin.
          </Text>
          <Text style={[styles.messageTime, { color: colors.primaryForeground, opacity: 0.5 }]}>
            10:42 ✓
          </Text>
        </View>
        <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
          <Text style={[styles.messageText, { color: colors.foreground }]}>{person.preview}</Text>
          <Text style={[styles.messageTime, { color: colors.mutedForeground }]}>10:42</Text>
        </View>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, styles.outgoing, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.messageText, { color: colors.primaryForeground }]}>
              {message.text}
            </Text>
            <Text style={[styles.messageTime, { color: colors.primaryForeground, opacity: 0.5 }]}>
              just now ✓
            </Text>
          </View>
        ))}
      </ScrollView>
      <View
        style={[styles.composer, { paddingBottom: insets.bottom + 12, borderColor: colors.border }]}
      >
        <TextInput
          testID="expand-chat-input"
          accessibilityLabel="Message"
          placeholder={`Message ${person.name.split(' ')[0]}`}
          placeholderTextColor={colors.mutedForeground}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted }]}
        />
        <Pressable
          testID="expand-chat-send"
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={!draft.trim()}
          onPress={send}
          style={[
            styles.send,
            { backgroundColor: colors.primary, opacity: draft.trim() ? 1 : 0.35 },
          ]}
        >
          <Text style={{ color: colors.primaryForeground, fontSize: 18 }}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ExpandScreenDemo() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<{ person: Person; origin: ExpandScreenOrigin }>();
  const [open, setOpen] = useState(false);
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.home,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 36,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>A LITTLE CONNECTION</Text>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Good conversations{'\n'}start here.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Tap a conversation. Give it a little more room.
      </Text>
      <View style={styles.list}>
        {people.map((person) => (
          <ChatRow
            key={person.id}
            person={person}
            onOpen={(next, origin) => {
              setSelection({ person: next, origin });
              setOpen(true);
            }}
          />
        ))}
      </View>
      <View style={[styles.footer, { borderColor: colors.border }]}>
        <Text style={[styles.footerMark, { color: colors.mint }]}>↗</Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          A small window into{'\n'}a bigger conversation.
        </Text>
      </View>
      <ExpandScreen
        open={open}
        origin={selection?.origin}
        onClose={() => setOpen(false)}
        testID="expand-chat-screen"
        accessibilityLabel={`Conversation with ${selection?.person.name ?? ''}`}
      >
        {selection && (
          <Conversation
            key={selection.person.id}
            person={selection.person}
            close={() => setOpen(false)}
          />
        )}
      </ExpandScreen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  home: { flexGrow: 1, paddingHorizontal: 22 },
  eyebrow: { fontSize: 9, letterSpacing: 2, marginBottom: 15 },
  heading: { fontSize: 36, lineHeight: 41, letterSpacing: -1.5, fontWeight: '500' },
  description: { fontSize: 12, lineHeight: 20, marginTop: 13, maxWidth: 260 },
  list: { gap: 12, marginTop: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 17,
    borderWidth: 1,
    borderRadius: 24,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatar: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 11, fontWeight: '600' },
  online: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    bottom: 0,
    right: 0,
  },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 13, fontWeight: '600' },
  time: { fontSize: 9 },
  topic: { fontSize: 10, marginTop: 5 },
  preview: { fontSize: 10, marginTop: 7, opacity: 0.7 },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    paddingTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerMark: { fontSize: 30 },
  footerText: { fontSize: 11, lineHeight: 18 },
  conversation: { flex: 1 },
  chatHeader: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  backMark: { fontSize: 29, lineHeight: 32 },
  messages: { padding: 21, gap: 17, flexGrow: 1 },
  today: { fontSize: 8, letterSpacing: 1.3, textAlign: 'center', marginVertical: 15 },
  bubble: {
    padding: 15,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    alignSelf: 'flex-start',
    maxWidth: '82%',
    gap: 9,
  },
  outgoing: { alignSelf: 'flex-end', borderBottomLeftRadius: 18, borderBottomRightRadius: 5 },
  messageText: { fontSize: 13, lineHeight: 20 },
  messageTime: { fontSize: 8, textAlign: 'right' },
  composer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, height: 46, borderRadius: 24, paddingHorizontal: 17, fontSize: 12 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
