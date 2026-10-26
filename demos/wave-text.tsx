import { StyleSheet, View } from 'react-native';
import { WaveText } from '../ui/wave-text';
import { TextAnimationDemo } from './text-animation-demo';
export default function WaveTextDemo() {
  return (
    <TextAnimationDemo
      title="Wave Text"
      description="Give each character a gentle traveling wave. For greetings, playful empty states, and small moments of delight."
      index="07"
    >
      <View style={styles.samples}>
        <WaveText text="Hey, you made it." amplitude={5} style={styles.primary} />
        <WaveText
          text="Stay a little curious."
          amplitude={2}
          duration={2200}
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
