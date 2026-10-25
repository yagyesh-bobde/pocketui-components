import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';

export function FailureScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors, fontSize, fontWeight } = useTheme();
  return (
    <View testID="payment-failure" style={styles.content}>
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
        style={[styles.button, { backgroundColor: colors.primary }]}
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
    </View>
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
});
