import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import type { PaymentFlowProps, PaymentPayee } from '../model';
import { Keypad } from '../parts/keypad';
import { SlideToPay } from '../parts/slide-to-pay';
import type { PaymentController } from '../use-payment';

export function AmountScreen({
  controller,
  payee,
  account,
}: {
  controller: PaymentController;
  payee: PaymentPayee;
  account?: PaymentFlowProps['account'];
}) {
  const { colors, fontSize, fontWeight } = useTheme();
  const [whole = '0', fraction] = controller.state.amountDraft.split('.');
  const displayAmount =
    Number(whole).toLocaleString('en-IN') + (fraction === undefined ? '' : `.${fraction}`);
  return (
    <View style={styles.screen} testID="payment-amount">
      <View style={styles.summary}>
        <View style={[styles.avatar, { backgroundColor: colors.successSurface }]}>
          <Text
            style={{
              color: colors.success,
              fontSize: fontSize.title,
              fontWeight: fontWeight.semibold,
            }}
          >
            {payee.initials || payee.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text
          style={[
            styles.center,
            { color: colors.foreground, fontSize: fontSize.title, fontWeight: fontWeight.semibold },
          ]}
        >
          {payee.name}
        </Text>
        {payee.handle ? (
          <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
            {payee.handle}
          </Text>
        ) : null}
        <Text
          accessibilityLabel={`Amount ${controller.state.amountDraft} rupees`}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          numberOfLines={1}
          style={[
            styles.amount,
            { color: colors.foreground, fontSize: fontSize.amount, fontWeight: fontWeight.bold },
          ]}
        >
          ₹{displayAmount}
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
          Enter an amount
        </Text>
      </View>
      <View style={[styles.panel, { borderColor: colors.border }]}>
        <View style={styles.account}>
          <Text
            style={{
              color: colors.foreground,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
            }}
          >
            {account?.label ?? 'Payment account'}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
            {account?.detail ?? 'Confirm with your app passcode'}
          </Text>
        </View>
        <SlideToPay enabled={controller.canConfirmAmount} onComplete={controller.confirmAmount} />
        <Keypad decimal onKey={controller.editAmount} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', gap: 32 },
  summary: { alignItems: 'center', paddingTop: 24, gap: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  center: { textAlign: 'center' },
  amount: { width: '100%', textAlign: 'center', marginTop: 16 },
  panel: { borderTopWidth: 1, paddingTop: 16, gap: 10 },
  account: { gap: 4, paddingBottom: 4 },
});
