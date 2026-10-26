import { StyleSheet, View } from 'react-native';
import { NumberTicker } from '../ui/number-ticker';
import { TextAnimationDemo } from './text-animation-demo';
export default function NumberTickerDemo() {
  return (
    <TextAnimationDemo
      title="Number Ticker"
      description="Count smoothly toward a value with an eased finish. For balances, savings, activity totals, and statistics."
      index="06"
    >
      <View style={styles.samples}>
        <NumberTicker
          value={2480}
          from={0}
          format={(n) => `$${n.toFixed(2)}`}
          style={styles.primary}
        />
        <NumberTicker
          value={98.6}
          duration={1800}
          format={(n) => `${n.toFixed(1)}%`}
          style={styles.secondary}
        />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
