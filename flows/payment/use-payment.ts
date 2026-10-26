import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import {
  createPaymentAttemptRunner,
  createPaymentState,
  type PaymentAction,
  type PaymentFlowProps,
  type PaymentState,
  paymentReducer,
} from './model';

export interface PaymentController {
  state: PaymentState;
  pinLength: number;
  canConfirmAmount: boolean;
  canConfirmPayment: boolean;
  failureMessage: string | null;
  editAmount(key: string): void;
  enterPinDigit(digit: string): void;
  deletePinDigit(): void;
  confirmAmount(): void;
  confirmPayment(): void;
  back(): boolean;
  cancel(): boolean;
  retry(): void;
  showReceipt(): void;
  done(): void;
}

// Feedback failures must never change a settled payment or become unhandled rejections.
function notify(callback: () => unknown): void {
  try {
    void Promise.resolve(callback()).catch(() => {});
  } catch {
    // Host feedback is optional; the payment state remains authoritative.
  }
}

export function usePayment(props: PaymentFlowProps): PaymentController {
  const { onPay, onDone, onCancel, onHaptic, onSuccess, payee, reference } = props;
  // The host amount initializes this flow; later prop updates cannot change a charge.
  const [state, dispatch] = useReducer(paymentReducer, props.amount ?? 0, createPaymentState);
  const stateRef = useRef(state);
  const [runner] = useState(createPaymentAttemptRunner);
  const pinRef = useRef('');
  const [pinLength, setPinLength] = useState(0);
  const mountedRef = useRef(true);
  const closedRef = useRef(false);

  const transition = useCallback((action: PaymentAction): PaymentState => {
    const current = stateRef.current;
    if (!mountedRef.current || closedRef.current) return current;
    const next = paymentReducer(current, action);
    if (next !== current) {
      // Lock synchronously so rapid events cannot race a batched React render.
      stateRef.current = next;
      dispatch(action);
    }
    return next;
  }, []);

  const clearPin = useCallback(() => {
    pinRef.current = '';
    setPinLength(0);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      pinRef.current = '';
      runner.invalidate();
    };
  }, [runner]);

  const editAmount = useCallback(
    (key: string) => {
      const before = stateRef.current;
      if (transition({ type: 'edit-amount', key }) !== before) {
        notify(() => onHaptic?.('selection'));
      }
    },
    [onHaptic, transition],
  );

  const enterPinDigit = useCallback(
    (digit: string) => {
      if (
        !mountedRef.current ||
        closedRef.current ||
        stateRef.current.step !== 'passcode' ||
        !/^\d$/.test(digit) ||
        pinRef.current.length >= 4
      ) {
        return;
      }
      pinRef.current += digit;
      setPinLength(pinRef.current.length);
      notify(() => onHaptic?.('selection'));
    },
    [onHaptic],
  );

  const deletePinDigit = useCallback(() => {
    if (
      !mountedRef.current ||
      closedRef.current ||
      stateRef.current.step !== 'passcode' ||
      pinRef.current.length === 0
    ) {
      return;
    }
    pinRef.current = pinRef.current.slice(0, -1);
    setPinLength(pinRef.current.length);
    notify(() => onHaptic?.('selection'));
  }, [onHaptic]);

  const confirmAmount = useCallback(() => {
    const before = stateRef.current;
    if (transition({ type: 'confirm-amount' }) !== before) {
      clearPin();
      notify(() => onHaptic?.('confirmation'));
    }
  }, [clearPin, onHaptic, transition]);

  const confirmPayment = useCallback(() => {
    if (
      !mountedRef.current ||
      closedRef.current ||
      stateRef.current.step !== 'passcode' ||
      pinRef.current.length !== 4
    ) {
      return;
    }
    const request = { amount: stateRef.current.amountMinorUnits / 100, pin: pinRef.current };
    const receiptPayee = { ...payee };
    const processing = transition({ type: 'start-payment' });
    clearPin();
    const pending = runner.run(request, onPay);
    notify(() => onHaptic?.('confirmation'));
    void pending.then((result) => {
      if (
        !mountedRef.current ||
        closedRef.current ||
        result.status === 'ignored' ||
        stateRef.current.step !== 'processing' ||
        stateRef.current.attemptId !== processing.attemptId
      ) {
        return;
      }
      if (result.status === 'failure') {
        transition({ type: 'payment-failed', attemptId: processing.attemptId });
        notify(() => onHaptic?.('error'));
        return;
      }
      const receipt = {
        amount: request.amount,
        payee: receiptPayee,
        completedAt: Date.now(),
        ...(reference === undefined ? {} : { reference }),
      };
      transition({ type: 'payment-succeeded', attemptId: processing.attemptId, receipt });
      notify(() => onHaptic?.('success'));
      if (mountedRef.current && !closedRef.current) notify(() => onSuccess?.(receipt));
    });
  }, [clearPin, onHaptic, onPay, onSuccess, payee, reference, runner, transition]);

  const cancel = useCallback((): boolean => {
    if (!mountedRef.current || closedRef.current) return true;
    const step = stateRef.current.step;
    if (step === 'processing' || step === 'success' || step === 'receipt') return true;
    if (!onCancel) return false;
    closedRef.current = true;
    runner.invalidate();
    clearPin();
    notify(onCancel);
    return true;
  }, [clearPin, onCancel, runner]);

  const back = useCallback((): boolean => {
    if (!mountedRef.current || closedRef.current) return true;
    const before = stateRef.current;
    if (before.step === 'amount') return cancel();
    if (transition({ type: 'back' }) !== before) clearPin();
    return true;
  }, [cancel, clearPin, transition]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', back);
    return () => subscription.remove();
  }, [back]);

  const retry = useCallback(() => {
    const before = stateRef.current;
    if (transition({ type: 'retry' }) !== before) {
      runner.invalidate();
      clearPin();
    }
  }, [clearPin, runner, transition]);

  const showReceipt = useCallback(() => {
    transition({ type: 'show-receipt' });
  }, [transition]);

  const done = useCallback(() => {
    const current = stateRef.current;
    if (
      !mountedRef.current ||
      closedRef.current ||
      (current.step !== 'success' && current.step !== 'receipt') ||
      !current.receipt
    ) {
      return;
    }
    closedRef.current = true;
    runner.invalidate();
    clearPin();
    const receipt = current.receipt;
    notify(() => onDone(receipt));
  }, [clearPin, onDone, runner]);

  return {
    state,
    pinLength,
    canConfirmAmount: state.step === 'amount' && state.amountMinorUnits > 0,
    canConfirmPayment: state.step === 'passcode' && pinLength === 4,
    failureMessage:
      state.step === 'failure' ? 'Payment could not be completed. Please try again.' : null,
    editAmount,
    enterPinDigit,
    deletePinDigit,
    confirmAmount,
    confirmPayment,
    back,
    cancel,
    retry,
    showReceipt,
    done,
  };
}
