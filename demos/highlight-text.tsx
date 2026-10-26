import { StyleSheet, View } from 'react-native';
import { HighlightText } from '../ui/highlight-text';
import { TextAnimationDemo } from './text-animation-demo';
export default function HighlightTextDemo() {
  return (
    <TextAnimationDemo
      title="Highlight Text"
      description="Sweep a marker behind a phrase while keeping the text readable. For key benefits, onboarding, and earned rewards."
      index="08"
    >
      <View style={styles.samples}>
        <HighlightText text="Keep the good part." delay={150} style={styles.primary} />
        <HighlightText text="Every small win counts." duration={1100} style={styles.secondary} />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
