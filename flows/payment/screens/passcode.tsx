import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import { Keypad } from '../parts/keypad';
import type { PaymentController } from '../use-payment';

export function PasscodeScreen({ controller }: { controller: PaymentController }) {
  const { colors, fontSize, fontWeight } = useTheme();
  return (
    <View testID="payment-passcode" style={styles.screen}>
      <View style={styles.summary}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: fontSize.heading,
            fontWeight: fontWeight.semibold,
          }}
        >
          App passcode
        </Text>
        <Text style={[styles.center, { color: colors.mutedForeground, fontSize: fontSize.md }]}>
          Enter the four-digit passcode for this app. This is not your bank or UPI PIN.
        </Text>
        <View
          accessible
          accessibilityLabel={`${controller.pinLength} of 4 passcode digits entered`}
          style={styles.dots}
        >
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  borderColor: colors.foreground,
                  backgroundColor: index < controller.pinLength ? colors.foreground : undefined,
                },
              ]}
            />
          ))}
        </View>
        <Text style={{ color: colors.foreground, fontSize: fontSize.title }}>
          ₹{controller.state.amountDraft}
        </Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          testID="payment-confirm"
          accessibilityRole="button"
          accessibilityLabel="Confirm payment"
          accessibilityState={{ disabled: !controller.canConfirmPayment }}
          disabled={!controller.canConfirmPayment}
          onPress={controller.confirmPayment}
          style={[
            styles.confirm,
            { backgroundColor: colors.primary, opacity: controller.canConfirmPayment ? 1 : 0.4 },
          ]}
        >
          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: fontSize.md,
              fontWeight: fontWeight.semibold,
            }}
          >
            Confirm payment
          </Text>
        </Pressable>
        <Keypad
          onKey={(key) =>
            key === 'delete' ? controller.deletePinDigit() : controller.enterPinDigit(key)
          }
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', gap: 40 },
  summary: { alignItems: 'center', gap: 20, paddingTop: 48 },
  center: { textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 20, paddingVertical: 24 },
  dot: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 8 },
  controls: { gap: 16 },
  confirm: {
    minHeight: 52,
    padding: 14,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
