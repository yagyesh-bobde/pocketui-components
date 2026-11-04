import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { PromptInput } from '../ui/prompt-input';
import { useTheme } from '../ui/theme';

const sample = 'Help me make a little room for a new idea.';

export default function PromptInputDemo() {
  const { colors } = useTheme();
  const [value, setValue] = useState(sample);
  const [status, setStatus] = useState<'ready' | 'streaming'>('ready');
  const [sent, setSent] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => {
    if (status !== 'streaming') return;
    const timer = setTimeout(() => {
      setStatus('ready');
      setResult('Start with a blank page. Give your idea a small, clear first step.');
    }, 2600);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Text style={[styles.eyebrow, { color: colors.success }]}>
        POCKETUI / LOCAL COMPOSER DEMO
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        A thought.{'\n'}A place to start.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Write freely. Send when you’re ready. Stop when you need to.
      </Text>
      <View style={[styles.response, { backgroundColor: colors.muted }]}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          {sent ? 'YOUR LAST PROMPT' : 'A LITTLE SPACE FOR WHAT’S NEXT'}
        </Text>
        <Text style={[styles.body, { color: colors.foreground }]}>
          {sent || 'The sample response runs locally. Nothing is sent to a service.'}
        </Text>
        {(result || status === 'streaming') && (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.body, { color: colors.mutedForeground }]}
          >
            {status === 'streaming' ? 'Preparing the sample reply…' : result}
          </Text>
        )}
      </View>
      <PromptInput
        value={value}
        onValueChange={setValue}
        status={status}
        testID="prompt-composer"
        onSubmit={(text) => {
          setSent(text);
          setValue('');
          setResult('');
          setStatus('streaming');
        }}
        onStop={() => {
          setStatus('ready');
          setResult('Sample response stopped. Your next draft is still here.');
        }}
      />
      <Pressable
        accessibilityRole="button"
        disabled={status === 'streaming'}
        onPress={() => {
          setValue(sample);
          setSent('');
          setResult('');
        }}
        testID="prompt-reset"
        style={styles.reset}
      >
        <Text style={{ color: colors.success, fontSize: 12 }}>Try the sample again ↗</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.4 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -1.1, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  response: { padding: 20, borderRadius: 20, gap: 16, minHeight: 150 },
  caption: { fontSize: 9, letterSpacing: 1.1 },
  body: { fontSize: 13, lineHeight: 22 },
  reset: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});
