import { StyleSheet, View } from 'react-native';
import { TextReveal } from '../ui/text-reveal';
import { TextAnimationDemo } from './text-animation-demo';
export default function TextRevealDemo() {
  return (
    <TextAnimationDemo
      title="Text Reveal"
      description="Reveal words with a staggered fade, upward slide, or scale. For onboarding headlines and content entrances."
      index="01"
    >
      <View style={styles.samples}>
        <TextReveal text="Make space for what matters." variant="slide" style={styles.primary} />
        <TextReveal text="A softer entrance." variant="fade" style={styles.secondary} />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
