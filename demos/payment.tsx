import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';
import { PaymentFlow, type PaymentFlowProps } from '../flows/payment';
import { useTheme } from '../ui/theme';

const payee = { name: 'Juniper Coffee', initials: 'JC', handle: 'juniper@example' };
const account = { label: 'Demo account •• 2048', detail: 'Fictional balance · ₹25,000' };
const haptics = {
  selection: HapticFeedbackTypes.selection,
  confirmation: HapticFeedbackTypes.impactMedium,
  success: HapticFeedbackTypes.notificationSuccess,
  error: HapticFeedbackTypes.notificationError,
} as const;
const onHaptic: PaymentFlowProps['onHaptic'] = (event) => trigger(haptics[event]);

/** The host owns its app passcode. This demo never reads, stores, or logs the request. */
export default function PaymentDemo() {
  const [instance, setInstance] = useState(0);
  return (
    <PaymentFlow
      key={instance}
      payee={payee}
      account={account}
      onHaptic={onHaptic}
      reference="DEMO-2048"
      onPay={() => new Promise<void>((resolve) => setTimeout(resolve, 5500))}
      onDone={() => setInstance((value) => value + 1)}
    />
  );
}

type Outcome = 'hold' | 'reject' | 'throw';
type Counts = { calls: number; success: number; done: number; cancel: number };

/** Recorder-only lifecycle harness; it is never copied with the registry flow. */
export function PaymentQADemo() {
  const { colors, fontSize } = useTheme();
  const [instance, setInstance] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [next, setNext] = useState<Outcome>('hold');
  const nextRef = useRef<Outcome>('hold');
  const held = useRef<(() => void)[]>([]);
  const [pending, setPending] = useState(0);
  const [counts, setCounts] = useState<Counts>({ calls: 0, success: 0, done: 0, cancel: 0 });
  const count = (name: keyof Counts) =>
    setCounts((value) => ({ ...value, [name]: value[name] + 1 }));
  const arm = (outcome: Outcome) => {
    nextRef.current = outcome;
    setNext(outcome);
  };
  const reset = () => {
    setInstance((value) => value + 1);
    setMounted(true);
  };
  const controls = [
    { id: 'reject-next', label: 'Reject next', action: () => arm('reject') },
    { id: 'throw-next', label: 'Throw next', action: () => arm('throw') },
    { id: 'unmount', label: 'Unmount', action: () => setMounted(false) },
    { id: 'remount', label: 'Remount', action: reset },
    {
      id: 'resolve',
      label: 'Resolve held',
      action: () => {
        held.current.shift()?.();
        setPending(held.current.length);
      },
    },
  ];
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.qa, { borderColor: colors.border }]}>
        <View style={styles.counters}>
          {Object.entries(counts).map(([name, value]) => (
            <Text
              key={name}
              testID={`payment-qa-${name}-count`}
              style={{ color: colors.foreground, fontSize: fontSize.sm }}
            >
              {name}: {value}
            </Text>
          ))}
          <Text
            testID="payment-qa-pending-count"
            style={{ color: colors.foreground, fontSize: fontSize.sm }}
          >
            pending: {pending}
          </Text>
          <Text
            testID="payment-qa-next"
            style={{ color: colors.foreground, fontSize: fontSize.sm }}
          >
            next: {next}
          </Text>
        </View>
        <View style={styles.controls}>
          {controls.map(({ id, label, action }) => (
            <Pressable
              key={id}
              testID={`payment-qa-${id}`}
              accessibilityRole="button"
              onPress={action}
              style={[styles.control, { backgroundColor: colors.muted }]}
            >
              <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {mounted ? (
        <PaymentFlow
          key={instance}
          payee={payee}
          account={account}
          onHaptic={onHaptic}
          reference="QA-2048"
          onPay={() => {
            count('calls');
            const outcome = nextRef.current;
            arm('hold');
            if (outcome === 'throw') throw new Error('Demo payment unavailable');
            if (outcome === 'reject') return Promise.reject(new Error('Demo payment rejected'));
            return new Promise<void>((resolve) => {
              held.current.push(resolve);
              setPending(held.current.length);
            });
          }}
          onSuccess={() => count('success')}
          onDone={() => {
            count('done');
            reset();
          }}
          onCancel={() => {
            count('cancel');
            reset();
          }}
        />
      ) : (
        <View testID="payment-qa-unmounted" style={styles.empty}>
          <Text style={{ color: colors.foreground }}>Payment unmounted</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  qa: { paddingTop: 60, paddingHorizontal: 12, paddingBottom: 8, gap: 6, borderBottomWidth: 1 },
  counters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  control: { minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', borderRadius: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
