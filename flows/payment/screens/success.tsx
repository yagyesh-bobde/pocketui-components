import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../../ui/theme';
import type { PaymentReceipt } from '../model';
import { PaymentIcon } from '../parts/icons';

export function SuccessScreen({
  receipt,
  onReceipt,
  onDone,
}: {
  receipt: PaymentReceipt;
  onReceipt: () => void;
  onDone: () => void;
}) {
  const { colors, fontSize, fontWeight } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Animated.View
      testID="payment-success"
      entering={reduced ? undefined : FadeIn.duration(400)}
      style={styles.content}
    >
      <View style={styles.sparkles} accessible={false}>
        <PaymentIcon kind="sparkle" color={colors.mint} />
        <PaymentIcon kind="sparkle" color={colors.mint} />
      </View>
      <Text style={{ color: colors.successInk, fontSize: fontSize.sm, letterSpacing: 2 }}>
        PAYMENT COMPLETE
      </Text>
      <Text
        style={[
          styles.center,
          { color: colors.successInk, fontSize: fontSize.title, fontWeight: fontWeight.semibold },
        ]}
      >
        {receipt.payee.name}
      </Text>
      <Text
        style={[
          styles.center,
          { color: colors.successInk, fontSize: fontSize.display, fontWeight: fontWeight.bold },
        ]}
      >
        ₹{receipt.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </Text>
      <Text style={[styles.date, { color: colors.successInk, fontSize: fontSize.sm }]}>
        {new Date(receipt.completedAt).toLocaleString()}
      </Text>
      <View style={styles.actions}>
        <Pressable
          testID="payment-view-receipt"
          accessibilityRole="button"
          onPress={onReceipt}
          style={[styles.button, { borderColor: colors.successInk }]}
        >
          <Text style={{ color: colors.successInk, fontSize: fontSize.md }}>View receipt</Text>
        </Pressable>
        <Pressable
          testID="payment-done"
          accessibilityRole="button"
          onPress={onDone}
          style={[styles.button, { backgroundColor: colors.successInk }]}
        >
          <Text
            style={{
              color: colors.successDepth,
              fontSize: fontSize.md,
              fontWeight: fontWeight.semibold,
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: 20 },
  center: { textAlign: 'center' },
  date: { textAlign: 'center', opacity: 0.75, marginTop: 12 },
  sparkles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: -30,
    marginBottom: 10,
  },
  actions: { width: '100%', gap: 12, marginTop: 36 },
  button: {
    minHeight: 50,
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
