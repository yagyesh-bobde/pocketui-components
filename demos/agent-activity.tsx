import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AgentActivity, type AgentActivityItem } from '../ui/agent-activity';
import { useTheme } from '../ui/theme';

const steps = [
  ['understand', 'Read the request', 'Find the shape of the problem.'],
  ['plan', 'Make a small plan', 'Keep the next steps clear.'],
  ['draft', 'Prepare a first draft', 'Bring the useful pieces together.'],
  ['review', 'Review the details', 'Leave things a little better.'],
] as const;

export default function AgentActivityDemo() {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (failed) return;
    const timer = setTimeout(
      () => setStep((current) => (current >= steps.length ? 0 : current + 1)),
      step >= steps.length ? 2600 : 1800,
    );
    return () => clearTimeout(timer);
  }, [step, failed]);
  const items: AgentActivityItem[] = steps.map(([id, title, description], index) => ({
    id,
    title,
    description,
    status: index < step ? 'complete' : index === step ? (failed ? 'error' : 'running') : 'pending',
  }));
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / SAMPLE RUN</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Show the work.{'\n'}Step by step.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        An ordered view of progress. This local timeline shows representative states.
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <AgentActivity
          items={items}
          title="A little plan, taking shape"
          onRetry={() => setFailed(false)}
          testID="agent-timeline"
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setStep(0);
            setFailed(false);
          }}
          testID="agent-replay"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.primaryForeground, fontSize: 12 }}>Replay sample</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setStep(2);
            setFailed(true);
          }}
          testID="agent-failure"
          style={[styles.button, { backgroundColor: colors.muted }]}
        >
          <Text style={{ color: colors.foreground, fontSize: 12 }}>Show a failed step</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -1.1, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 22, padding: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { minHeight: 44, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
});
