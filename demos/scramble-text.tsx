import { StyleSheet, View } from 'react-native';
import { ScrambleText } from '../ui/scramble-text';
import { TextAnimationDemo } from './text-animation-demo';
export default function ScrambleTextDemo() {
  return (
    <TextAnimationDemo
      title="Scramble Text"
      description="Resolve changing characters into a readable message. For short intros, unlock moments, and playful confirmations."
      index="05"
    >
      <View style={styles.samples}>
        <ScrambleText text="Something good awaits." duration={1000} style={styles.primary} />
        <ScrambleText text="ACCESS GRANTED" duration={1600} style={styles.secondary} />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
