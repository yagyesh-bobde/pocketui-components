import { StyleSheet, View } from 'react-native';
import { Typewriter } from '../ui/typewriter';
import { TextAnimationDemo } from './text-animation-demo';
export default function TypewriterDemo() {
  return (
    <TextAnimationDemo
      title="Typewriter"
      description="Type a message one character at a time, with an optional cursor. For welcome messages and assistant responses."
      index="02"
    >
      <View style={styles.samples}>
        <Typewriter text="Your next idea starts here." speed={55} style={styles.primary} />
        <Typewriter text="One thought at a time." speed={90} cursor="_" style={styles.secondary} />
      </View>
    </TextAnimationDemo>
  );
}
const styles = StyleSheet.create({
  samples: { gap: 40, width: '100%' },
  primary: { fontSize: 36, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  secondary: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
});
