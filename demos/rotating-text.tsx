import { StyleSheet, View } from 'react-native';
import { RotatingText } from '../ui/rotating-text';
import { TextAnimationDemo } from './text-animation-demo';
export default function RotatingTextDemo() {
  return (
    <TextAnimationDemo
      title="Rotating Text"
      description="Cycle through short phrases with an upward transition. For changing headlines, statuses, and feature callouts."
      index="03"
    >
      <View style={styles.samples}>
        <RotatingText
          texts={['Time to focus.', 'Room to breathe.', 'Space to create.']}
          style={styles.primary}
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
