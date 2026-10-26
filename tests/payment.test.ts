import { describe, expect, test } from 'bun:test';
import {
  amountInMinorUnits,
  createPaymentAttemptRunner,
  createPaymentState,
  editAmount,
  type PaymentReceipt,
  paymentReducer,
} from '../flows/payment/model';

function deferred() {
  let resolve = () => {};
  let reject = (_reason?: unknown) => {};
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const request = { amount: 0.29, pin: '1234' };
const receipt: PaymentReceipt = {
  amount: 0.29,
  payee: { name: 'Example shop' },
  completedAt: 123,
};

function processingState() {
  return paymentReducer(paymentReducer(createPaymentState(0.29), { type: 'confirm-amount' }), {
    type: 'start-payment',
  });
}

describe('payment amount editing', () => {
  test('limits precision and ignores repeated decimal points', () => {
    expect(editAmount('12.34', '5')).toBe('12.34');
    expect(editAmount('12.3', '.')).toBe('12.3');
    expect(editAmount('0', '.')).toBe('0.');
    expect(editAmount('0.', '.')).toBe('0.');
  });

  test('deletes digits and replaces the initial zero', () => {
    expect(editAmount('12.34', 'delete')).toBe('12.3');
    expect(editAmount('1', 'delete')).toBe('0');
    expect(editAmount('0', 'delete')).toBe('0');
    expect(editAmount('0', '4')).toBe('4');
    expect(editAmount('0', '0')).toBe('0');
    expect(editAmount('12', 'not-a-key')).toBe('12');
  });

  test('converts decimal strings to exact integer cents', () => {
    expect(amountInMinorUnits('0.29')).toBe(29);
    expect(amountInMinorUnits('12.3')).toBe(1230);
    expect(amountInMinorUnits('12.')).toBe(1200);
    expect(amountInMinorUnits('999999.99')).toBe(99_999_999);
  });

  test('never accepts an amount beyond the cap or malformed input', () => {
    expect(editAmount('999999', '9')).toBe('999999');
    expect(editAmount('999999.99', '9')).toBe('999999.99');
    for (const draft of ['1000000', '999999.999', '-1', 'Infinity', 'NaN', '1e2', '1.2.3']) {
      expect(amountInMinorUnits(draft)).toBe(0);
    }
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1000000, 1.001, 0.1 + 0.2])(
    'normalizes invalid initial amount %s to disabled zero',
    (amount) => {
      const state = createPaymentState(amount);
      expect(state.amountDraft).toBe('0');
      expect(state.amountMinorUnits).toBe(0);
      expect(paymentReducer(state, { type: 'confirm-amount' })).toBe(state);
    },
  );

  test('preserves valid initial cents and only advances a positive amount', () => {
    expect(createPaymentState(0.29).amountMinorUnits).toBe(29);
    expect(createPaymentState(999999.99).amountMinorUnits).toBe(99_999_999);
    const zero = createPaymentState(0);
    expect(paymentReducer(zero, { type: 'confirm-amount' })).toBe(zero);
    const edited = paymentReducer(zero, { type: 'edit-amount', key: '1' });
    expect(paymentReducer(edited, { type: 'confirm-amount' }).step).toBe('passcode');
  });
});

describe('payment transitions', () => {
  test('ignores success, failure, receipt, and retry before a payment starts', () => {
    const state = createPaymentState(0.29);
    expect(paymentReducer(state, { type: 'start-payment' })).toBe(state);
    expect(paymentReducer(state, { type: 'payment-succeeded', attemptId: 0, receipt })).toBe(state);
    expect(paymentReducer(state, { type: 'payment-failed', attemptId: 0 })).toBe(state);
    expect(paymentReducer(state, { type: 'show-receipt' })).toBe(state);
    expect(paymentReducer(state, { type: 'retry' })).toBe(state);
  });

  test('allows returning from passcode to edit, then locks amount through processing', () => {
    const passcode = paymentReducer(createPaymentState(0.29), { type: 'confirm-amount' });
    expect(paymentReducer(passcode, { type: 'edit-amount', key: 'delete' })).toBe(passcode);
    const back = paymentReducer(passcode, { type: 'back' });
    expect(back.step).toBe('amount');
    expect(paymentReducer(back, { type: 'edit-amount', key: 'delete' }).amountDraft).toBe('0.2');
    const processing = paymentReducer(passcode, { type: 'start-payment' });
    expect(paymentReducer(processing, { type: 'back' })).toBe(processing);
    expect(paymentReducer(processing, { type: 'start-payment' })).toBe(processing);
    expect(paymentReducer(processing, { type: 'edit-amount', key: '9' })).toBe(processing);
    expect(paymentReducer(processing, { type: 'show-receipt' })).toBe(processing);
  });

  test('rejects stale results when retrying and never unlocks the failed amount', () => {
    const first = processingState();
    const failed = paymentReducer(first, { type: 'payment-failed', attemptId: first.attemptId });
    expect(failed.step).toBe('failure');
    expect(paymentReducer(failed, { type: 'edit-amount', key: '9' })).toBe(failed);
    expect(
      paymentReducer(failed, { type: 'payment-succeeded', attemptId: first.attemptId, receipt }),
    ).toBe(failed);
    const retry = paymentReducer(failed, { type: 'retry' });
    expect(retry.step).toBe('passcode');
    expect(retry.amountMinorUnits).toBe(29);
    expect(retry.receipt).toBeNull();
    expect(paymentReducer(retry, { type: 'back' })).toBe(retry);
    const second = paymentReducer(retry, { type: 'start-payment' });
    expect(second.attemptId).toBeGreaterThan(first.attemptId);
    expect(paymentReducer(second, { type: 'payment-failed', attemptId: first.attemptId })).toBe(
      second,
    );
    expect(
      paymentReducer(second, { type: 'payment-succeeded', attemptId: first.attemptId, receipt }),
    ).toBe(second);
    const success = paymentReducer(second, {
      type: 'payment-succeeded',
      attemptId: second.attemptId,
      receipt,
    });
    expect(success.step).toBe('success');
    expect(success.receipt).toEqual(receipt);
  });

  test('failure Back returns to a passcode with the same amount', () => {
    const processing = processingState();
    const failed = paymentReducer(processing, {
      type: 'payment-failed',
      attemptId: processing.attemptId,
    });
    const back = paymentReducer(failed, { type: 'back' });
    expect(back.step).toBe('passcode');
    expect(back.amountMinorUnits).toBe(29);
  });

  test('receipt follows success and terminal screens cannot reenter payment', () => {
    const processing = processingState();
    const success = paymentReducer(processing, {
      type: 'payment-succeeded',
      attemptId: processing.attemptId,
      receipt,
    });
    const completed = paymentReducer(success, { type: 'show-receipt' });
    expect(completed.step).toBe('receipt');
    for (const state of [success, completed]) {
      expect(paymentReducer(state, { type: 'back' })).toBe(state);
      expect(paymentReducer(state, { type: 'retry' })).toBe(state);
      expect(paymentReducer(state, { type: 'start-payment' })).toBe(state);
      expect(paymentReducer(state, { type: 'payment-failed', attemptId: state.attemptId })).toBe(
        state,
      );
    }
  });
});

describe('payment attempt runner', () => {
  test('does not report success while the host payment is still pending', async () => {
    const runner = createPaymentAttemptRunner();
    const pending = deferred();
    let settled = false;
    const result = runner.run(request, () => pending.promise);
    void result.then(() => {
      settled = true;
    });
    await Bun.sleep(0);
    expect(settled).toBe(false);
    pending.resolve();
    expect(await result).toEqual({ status: 'success' });
    expect(settled).toBe(true);
  });

  test('coalesces concurrent submissions into one host call and snapshots the request', async () => {
    const runner = createPaymentAttemptRunner();
    const pending = deferred();
    const received: { amount: number; pin: string }[] = [];
    const mutableRequest = { ...request };
    const first = runner.run(mutableRequest, (value) => {
      received.push(value);
      return pending.promise;
    });
    const duplicate = runner.run({ amount: 500, pin: '0000' }, async () => {
      throw new Error('Duplicate host callback must not run');
    });
    mutableRequest.amount = 500;
    mutableRequest.pin = '0000';
    expect(duplicate).toBe(first);
    await Promise.resolve();
    expect(received).toEqual([request]);
    pending.resolve();
    expect(await first).toEqual({ status: 'success' });
    expect(await duplicate).toEqual({ status: 'success' });
  });

  test('invalidates an in-flight success without disturbing a newer attempt', async () => {
    const runner = createPaymentAttemptRunner();
    const oldPayment = deferred();
    const newPayment = deferred();
    const first = runner.run(request, () => oldPayment.promise);
    await Promise.resolve();
    runner.invalidate();
    let newCalls = 0;
    const second = runner.run(request, () => {
      newCalls += 1;
      return newPayment.promise;
    });
    await Promise.resolve();
    oldPayment.resolve();
    expect(await first).toEqual({ status: 'ignored' });
    expect(runner.run(request, async () => {})).toBe(second);
    expect(newCalls).toBe(1);
    newPayment.resolve();
    expect(await second).toEqual({ status: 'success' });
  });

  test('ignores invalidated rejections and can invalidate before host invocation', async () => {
    const runner = createPaymentAttemptRunner();
    const pending = deferred();
    const first = runner.run(request, () => pending.promise);
    await Promise.resolve();
    runner.invalidate();
    pending.reject(new Error('Sensitive host failure'));
    expect(await first).toEqual({ status: 'ignored' });
    let calls = 0;
    const second = runner.run(request, async () => {
      calls += 1;
    });
    runner.invalidate();
    expect(await second).toEqual({ status: 'ignored' });
    expect(calls).toBe(0);
  });

  test('converts rejection to a safe failure result and permits a fresh successful retry', async () => {
    const runner = createPaymentAttemptRunner();
    const pending = deferred();
    const first = runner.run(request, () => pending.promise);
    await Promise.resolve();
    pending.reject({ pin: request.pin, message: 'Host details must not escape' });
    expect(await first).toEqual({ status: 'failure' });
    expect(await runner.run(request, async () => {})).toEqual({ status: 'success' });
  });

  test('converts synchronous throws to failure and still deduplicates a reentrant host call', async () => {
    const runner = createPaymentAttemptRunner();
    expect(
      await runner.run(request, () => {
        throw new Error('Synchronous host failure');
      }),
    ).toEqual({ status: 'failure' });
    let calls = 0;
    let reentrant: ReturnType<typeof runner.run> | undefined;
    const active = runner.run(request, async () => {
      calls += 1;
      reentrant = runner.run(request, async () => {
        calls += 1;
      });
    });
    expect(await active).toEqual({ status: 'success' });
    expect(reentrant).toBe(active);
    expect(calls).toBe(1);
  });
});
