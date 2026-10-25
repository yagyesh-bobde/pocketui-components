import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';

export function ProcessingScreen() {
  const { colors, fontSize, fontWeight } = useTheme();
  return (
    <View
      testID="payment-processing"
      accessibilityRole="progressbar"
      accessibilityLabel="Payment processing"
      accessibilityState={{ busy: true }}
      style={styles.content}
    >
      <Text
        style={{
          color: colors.foreground,
          fontSize: fontSize.heading,
          fontWeight: fontWeight.semibold,
        }}
      >
        Completing payment
      </Text>
      <Text style={[styles.center, { color: colors.mutedForeground, fontSize: fontSize.md }]}>
        Please keep this screen open while your app confirms the payment.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: 16 },
  center: { textAlign: 'center' },
});
