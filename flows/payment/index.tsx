import { useContext, useEffect } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../ui/theme';
import type { PaymentFlowProps } from './model';
import { PaymentMark } from './parts/payment-mark';
import { AmountScreen } from './screens/amount';
import { FailureScreen } from './screens/failure';
import { PasscodeScreen } from './screens/passcode';
import { ProcessingScreen } from './screens/processing';
import { ReceiptScreen } from './screens/receipt';
import { SuccessScreen } from './screens/success';
import { usePayment } from './use-payment';

export type { PaymentFlowProps, PaymentPayee, PaymentReceipt, PaymentRequest } from './model';

/** Requires the host's normal Gesture Handler / Reanimated native installation. */
export function PaymentFlow(props: PaymentFlowProps) {
  const insets = useContext(SafeAreaInsetsContext);
  return (
    <GestureHandlerRootView style={styles.root}>
      {insets ? (
        <PaymentContent {...props} />
      ) : (
        <SafeAreaProvider>
          <PaymentContent {...props} />
        </SafeAreaProvider>
      )}
    </GestureHandlerRootView>
  );
}

function PaymentContent(props: PaymentFlowProps) {
  const controller = usePayment(props);
  const { state } = controller;
  const { colors, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const successful = state.step === 'success';
  const canCancel =
    Boolean(props.onCancel) && ['amount', 'passcode', 'failure'].includes(state.step);
  const canGoBack = state.step === 'passcode' && state.attemptId === 0;
  useEffect(() => {
    const messages = {
      amount: 'Enter payment amount',
      passcode: 'Enter your app passcode',
      processing: 'Payment processing',
      success: 'Payment completed',
      receipt: 'Payment receipt',
      failure: 'Payment could not be completed',
    };
    AccessibilityInfo.announceForAccessibility(messages[state.step]);
  }, [state.step]);
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: successful ? colors.successDepth : colors.background },
      ]}
    >
      {successful ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" accessible={false}>
          <Defs>
            <LinearGradient id="payment-depth" x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor={colors.successDepth} />
              <Stop offset="1" stopColor={colors.successTeal} />
            </LinearGradient>
            <RadialGradient id="payment-glow" cx="80%" cy="45%" rx="80%" ry="55%">
              <Stop offset="0" stopColor={colors.success} stopOpacity={0.7} />
              <Stop offset="1" stopColor={colors.successDepth} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#payment-depth)" />
          <Rect width="100%" height="100%" fill="url(#payment-glow)" />
        </Svg>
      ) : null}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}
      >
        <View style={styles.nav}>
          {canGoBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to amount"
              onPress={controller.back}
              style={styles.navButton}
            >
              <Text style={{ color: colors.foreground, fontSize: fontSize.md }}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {canCancel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel payment"
              onPress={controller.cancel}
              style={styles.navButton}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.md }}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
        {state.step === 'amount' ? (
          <AmountScreen controller={controller} payee={props.payee} />
        ) : null}
        {state.step === 'passcode' ? <PasscodeScreen controller={controller} /> : null}
        {state.step === 'processing' || state.step === 'success' ? (
          <View style={styles.outcome}>
            <PaymentMark success={successful} />
            {successful && state.receipt ? (
              <SuccessScreen
                receipt={state.receipt}
                onReceipt={controller.showReceipt}
                onDone={controller.done}
              />
            ) : (
              <ProcessingScreen />
            )}
          </View>
        ) : null}
        {state.step === 'receipt' && state.receipt ? (
          <ReceiptScreen receipt={state.receipt} onDone={controller.done} />
        ) : null}
        {state.step === 'failure' ? (
          <FailureScreen
            message={
              controller.failureMessage || 'Payment could not be completed. Please try again.'
            }
            onRetry={controller.retry}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  nav: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  outcome: { flexGrow: 1, paddingVertical: 48, gap: 24 },
});
