import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../../ui/theme';

export function FailureScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors, fontSize, fontWeight } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Animated.View
      testID="payment-failure"
      entering={reduced ? undefined : FadeIn.duration(400)}
      style={styles.content}
    >
      <Text
        style={[
          styles.center,
          { color: colors.foreground, fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
        ]}
      >
        Payment not completed
      </Text>
      <Text style={[styles.center, { color: colors.mutedForeground, fontSize: fontSize.md }]}>
        {message}
      </Text>
      <Pressable
        testID="payment-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: fontSize.md,
            fontWeight: fontWeight.semibold,
          }}
        >
          Retry
        </Text>
      </Pressable>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: 24 },
  center: { textAlign: 'center' },
  button: {
    minHeight: 52,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
