import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StreamingResponse, type StreamingStatus } from '../ui/streaming-response';
import { useTheme } from '../ui/theme';

const sample =
  'A good interface leaves a little room to breathe.\n\nStart with a clear thought. Add only what helps it make sense. Let the next step feel like a natural part of the conversation.';

export default function StreamingResponseDemo() {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<StreamingStatus>('streaming');
  const [cycle, setCycle] = useState(0);
  const replay = () => {
    setText('');
    setStatus('streaming');
    setCycle((current) => current + 1);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: cycle deliberately restarts the local sample while status stays streaming.
  useEffect(() => {
    if (status !== 'streaming') return;
    let index = 0;
    setText('');
    const timer = setInterval(() => {
      index += 3;
      setText(sample.slice(0, index));
      if (index >= sample.length) setStatus('complete');
    }, 65);
    return () => clearInterval(timer);
  }, [status, cycle]);
  useEffect(() => {
    if (status !== 'complete') return;
    const timer = setTimeout(() => {
      setStatus('streaming');
      setCycle((current) => current + 1);
    }, 2800);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / LOCAL TEXT STREAM</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        One thought,{'\n'}as it arrives.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A sample response, arriving a few characters at a time.
      </Text>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <StreamingResponse
          text={text}
          status={status}
          onRetry={replay}
          errorMessage="Sample interruption. Your partial response stays visible."
          testID="streaming-answer"
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={replay}
          testID="streaming-replay"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.primaryForeground, fontSize: 12 }}>Replay sample</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setStatus('error')}
          testID="streaming-error"
          style={[styles.button, { backgroundColor: colors.muted }]}
        >
          <Text style={{ color: colors.foreground, fontSize: 12 }}>Show interruption</Text>
        </Pressable>
      </View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        The component displays your text. Your app owns the stream.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -1.1, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 22, padding: 22, minHeight: 300 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  note: { fontSize: 11, lineHeight: 18 },
});
