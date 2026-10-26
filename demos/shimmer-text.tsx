import { StyleSheet, View } from 'react-native';
import { ShimmerText } from '../ui/shimmer-text';
import { TextAnimationDemo } from './text-animation-demo';
export default function ShimmerTextDemo() {
  return (
    <TextAnimationDemo
      title="Shimmer Text"
      description="Move a bright band across a text label. For thinking states, loading messages, and quiet premium accents."
      index="04"
    >
      <View style={styles.samples}>
        <ShimmerText text="Thinking it through" duration={1800} style={styles.primary} />
        <ShimmerText text="Good things are coming." duration={2600} style={styles.secondary} />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
