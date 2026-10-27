import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SwipeDeck } from '../ui/swipe-deck';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

const ideas = [
  {
    id: '01',
    title: 'Take the\nscenic route.',
    category: 'A LITTLE ADVENTURE',
    detail: 'The best part might be the way there.',
    mark: '↗',
  },
  {
    id: '02',
    title: 'Make room\nfor nothing.',
    category: 'A SLOWER SUNDAY',
    detail: 'Leave a little space in your calendar.',
    mark: '◌',
  },
  {
    id: '03',
    title: 'Follow your\ncuriosity.',
    category: 'SOMETHING NEW',
    detail: 'You do not need a reason to begin.',
    mark: '✺',
  },
];

export default function SwipeDeckDemo() {
  const { colors } = useTheme();
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState('Three ideas. Keep the ones that feel like you.');
  return (
    <PlayfulDemo
      number="01"
      title="A little possibility."
      description="A stack of small adventures. Give one a nudge."
    >
      <SwipeDeck
        key={round}
        items={ideas}
        keyExtractor={(item) => item.id}
        testID="swipe-deck"
        onSwipe={(item, direction) =>
          setStatus(
            `${direction === 'right' ? 'Kept' : 'Passed'}: ${item.title.replace('\n', ' ')}`,
          )
        }
        renderCard={(item) => (
          <View
            style={[
              styles.card,
              { backgroundColor: item.id === '02' ? colors.successTeal : colors.successDepth },
            ]}
          >
            <View style={styles.row}>
              <Text style={[styles.eyebrow, { color: colors.successInk }]}>{item.category}</Text>
              <Text style={[styles.number, { color: colors.successInk }]}>{item.id}</Text>
            </View>
            <Text style={[styles.mark, { color: colors.mint }]}>{item.mark}</Text>
            <Text style={[styles.title, { color: colors.successInk }]}>{item.title}</Text>
            <Text style={[styles.detail, { color: colors.successInk }]}>{item.detail}</Text>
          </View>
        )}
      />
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.status, { color: colors.mutedForeground }]}
      >
        {status}
      </Text>
      <PlayAgain
        testID="deck-reset"
        onPress={() => {
          setRound((value) => value + 1);
          setStatus('Three ideas. Keep the ones that feel like you.');
        }}
      />
    </PlayfulDemo>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 24, gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 9, letterSpacing: 1.4, opacity: 0.7 },
  number: { fontSize: 11, opacity: 0.5 },
  mark: { fontSize: 56, lineHeight: 64, marginTop: 4 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '500', letterSpacing: -1 },
  detail: { fontSize: 12, lineHeight: 18, opacity: 0.65 },
  status: { fontSize: 12, lineHeight: 20, minHeight: 40, textAlign: 'center' },
});
