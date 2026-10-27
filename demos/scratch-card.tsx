import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScratchCard } from '../ui/scratch-card';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

export default function ScratchCardDemo() {
  const { colors } = useTheme();
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  return (
    <PlayfulDemo
      number="02"
      title="Good things hide."
      description="A small surprise, waiting just below the surface."
    >
      <View style={[styles.ticket, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.top}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            THE LITTLE REWARDS CLUB
          </Text>
          <Text style={[styles.serial, { color: colors.mutedForeground }]}>NO. 008</Text>
        </View>
        <ScratchCard
          key={round}
          testID="scratch-card"
          accessibilityLabel="Your little rewards card"
          onReveal={() => setRevealed(true)}
          height={238}
        >
          <View style={[styles.reward, { backgroundColor: colors.successDepth }]}>
            <Text style={[styles.star, { color: colors.mint }]}>✦</Text>
            <Text style={[styles.rewardLabel, { color: colors.successInk }]}>
              THIS ONE IS ON US.
            </Text>
            <Text style={[styles.amount, { color: colors.successInk }]}>A free coffee.</Text>
            <Text style={[styles.code, { color: colors.successInk }]}>USE CODE: LITTLEJOY</Text>
          </View>
        </ScratchCard>
        <View style={[styles.stub, { borderColor: colors.border }]}>
          <Text style={[styles.stubText, { color: colors.mutedForeground }]}>
            ONE SMALL REASON TO SMILE
          </Text>
          <Text style={[styles.stubText, { color: colors.foreground }]}>✺</Text>
        </View>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.status, { color: colors.mutedForeground }]}
      >
        {revealed
          ? 'Found it. A little joy, just for you.'
          : 'Trace your finger across the silver surface.'}
      </Text>
      <PlayAgain
        testID="scratch-reset"
        onPress={() => {
          setRound((value) => value + 1);
          setRevealed(false);
        }}
      />
    </PlayfulDemo>
  );
}

const styles = StyleSheet.create({
  ticket: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  eyebrow: { fontSize: 8, letterSpacing: 1.1, flexShrink: 1 },
  serial: { fontSize: 9, fontVariant: ['tabular-nums'] },
  reward: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 },
  star: { fontSize: 40 },
  rewardLabel: { fontSize: 9, letterSpacing: 2, opacity: 0.7 },
  amount: { fontSize: 32, fontWeight: '500', letterSpacing: -1 },
  code: { fontSize: 10, letterSpacing: 1.4, opacity: 0.7 },
  stub: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stubText: { fontSize: 8, letterSpacing: 1.3 },
  status: { fontSize: 12, lineHeight: 20, textAlign: 'center', minHeight: 40 },
});
