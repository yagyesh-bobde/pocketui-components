import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import type { PaymentReceipt } from '../model';

export function ReceiptScreen({
  receipt,
  onDone,
}: {
  receipt: PaymentReceipt;
  onDone: () => void;
}) {
  const { colors, fontSize, fontWeight } = useTheme();
  const rows = [
    ['To', receipt.payee.name],
    ...(receipt.payee.handle ? [['Handle', receipt.payee.handle]] : []),
    ['Completed', new Date(receipt.completedAt).toLocaleString()],
    ...(receipt.reference ? [['Reference', receipt.reference]] : []),
  ];
  return (
    <View testID="payment-receipt" style={styles.content}>
      <Text
        style={{
          color: colors.foreground,
          fontSize: fontSize.heading,
          fontWeight: fontWeight.semibold,
        }}
      >
        Payment receipt
      </Text>
      <Text
        style={{
          color: colors.foreground,
          fontSize: fontSize.display,
          fontWeight: fontWeight.bold,
        }}
      >
        ₹{receipt.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </Text>
      <Text style={{ color: colors.success, fontSize: fontSize.md }}>Completed</Text>
      <View style={styles.rows}>
        {rows.map(([label, value]) => (
          <View key={label} style={[styles.row, { borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>{label}</Text>
            <Text selectable style={{ color: colors.foreground, fontSize: fontSize.md }}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <Pressable
        testID="payment-done"
        accessibilityRole="button"
        onPress={onDone}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: fontSize.md,
            fontWeight: fontWeight.semibold,
          }}
        >
          Done
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  content: { gap: 20, paddingTop: 32 },
  rows: { marginVertical: 24 },
  row: { gap: 8, paddingVertical: 16, borderBottomWidth: 1 },
  button: {
    minHeight: 52,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
