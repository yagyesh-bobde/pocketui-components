import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HoldToConfirm } from '../ui/hold-to-confirm';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

export default function HoldToConfirmDemo() {
  const { colors } = useTheme();
  const [round, setRound] = useState(0);
  const [sent, setSent] = useState(false);
  return (
    <PlayfulDemo
      number="06"
      title="Make it intentional."
      description="Some things deserve a moment. Hold, watch the ring, and let it go."
    >
      <View style={[styles.letter, { backgroundColor: colors.successDepth }]}>
        <Text style={[styles.mark, { color: colors.mint }]}>{sent ? '✓' : '↗'}</Text>
        <Text style={[styles.eyebrow, { color: colors.successInk }]}>
          A NOTE TO YOUR FUTURE SELF
        </Text>
        <Text style={[styles.note, { color: colors.successInk }]}>
          You made time{'\n'}for what matters.
        </Text>
        <View style={styles.rule} />
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.caption, { color: colors.successInk }]}
        >
          {sent ? 'Sealed with a little intention.' : 'A small promise. Ready when you are.'}
        </Text>
      </View>
      <HoldToConfirm
        key={round}
        testID="hold-confirm"
        label="Seal this note"
        completedLabel="Note sealed"
        onConfirm={() => setSent(true)}
      />
      <PlayAgain
        testID="hold-reset"
        onPress={() => {
          setRound((value) => value + 1);
          setSent(false);
        }}
      />
    </PlayfulDemo>
  );
}
const styles = StyleSheet.create({
  letter: { borderRadius: 24, padding: 28, gap: 22 },
  mark: { fontSize: 48 },
  eyebrow: { fontSize: 8, letterSpacing: 1.7, opacity: 0.65 },
  note: { fontSize: 32, lineHeight: 38, letterSpacing: -1, fontWeight: '500' },
  rule: { height: 1, backgroundColor: '#ffffff33', marginTop: 12 },
  caption: { fontSize: 11, opacity: 0.65, lineHeight: 18 },
});
