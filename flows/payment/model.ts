export interface PaymentPayee {
  name: string;
  handle?: string;
  initials?: string;
}

export interface PaymentRequest {
  amount: number;
  pin: string;
}

export interface PaymentReceipt {
  amount: number;
  payee: PaymentPayee;
  completedAt: number;
  reference?: string;
}

export interface PaymentFlowProps {
  amount?: number;
  payee: PaymentPayee;
  onPay: (request: PaymentRequest) => Promise<void>;
  onDone: (receipt: PaymentReceipt) => void;
  onCancel?: () => void;
  onHaptic?: (event: 'selection' | 'confirmation' | 'success' | 'error') => void;
  onSuccess?: (receipt: PaymentReceipt) => void;
  reference?: string;
}

export type PaymentStep = 'amount' | 'passcode' | 'processing' | 'success' | 'receipt' | 'failure';

export interface PaymentState {
  step: PaymentStep;
  amountDraft: string;
  amountMinorUnits: number;
  attemptId: number;
  receipt: PaymentReceipt | null;
}

export type PaymentAction =
  | { type: 'edit-amount'; key: string }
  | { type: 'confirm-amount' }
  | { type: 'start-payment' }
  | { type: 'payment-succeeded'; attemptId: number; receipt: PaymentReceipt }
  | { type: 'payment-failed'; attemptId: number }
  | { type: 'back' }
  | { type: 'retry' }
  | { type: 'show-receipt' };

const amountPattern = /^(0|[1-9]\d{0,5})(?:\.\d{0,2})?$/;

export function amountInMinorUnits(draft: string): number {
  if (!amountPattern.test(draft)) return 0;
  const [whole = '0', fraction = ''] = draft.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

// A decimal string keeps valid cents exact (0.29 must become 29, not 28).
export function editAmount(draft: string, key: string): string {
  if (key === 'delete') return draft.slice(0, -1) || '0';
  if (key === '.') return draft.includes('.') ? draft : `${draft}.`;
  if (!/^\d$/.test(key)) return draft;
  const next = draft === '0' ? key : `${draft}${key}`;
  return amountPattern.test(next) ? next : draft;
}

export function createPaymentState(amount: number): PaymentState {
  const candidate = String(amount);
  const amountDraft = Number.isFinite(amount) && amountPattern.test(candidate) ? candidate : '0';
  return {
    step: 'amount',
    amountDraft,
    amountMinorUnits: amountInMinorUnits(amountDraft),
    attemptId: 0,
    receipt: null,
  };
}

export function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'edit-amount': {
      if (state.step !== 'amount') return state;
      const amountDraft = editAmount(state.amountDraft, action.key);
      if (amountDraft === state.amountDraft) return state;
      return { ...state, amountDraft, amountMinorUnits: amountInMinorUnits(amountDraft) };
    }
    case 'confirm-amount':
      return state.step === 'amount' && state.amountMinorUnits > 0
        ? { ...state, step: 'passcode' }
        : state;
    case 'start-payment':
      return state.step === 'passcode'
        ? { ...state, step: 'processing', attemptId: state.attemptId + 1 }
        : state;
    case 'payment-succeeded':
      return state.step === 'processing' && state.attemptId === action.attemptId
        ? { ...state, step: 'success', receipt: action.receipt }
        : state;
    case 'payment-failed':
      return state.step === 'processing' && state.attemptId === action.attemptId
        ? { ...state, step: 'failure' }
        : state;
    case 'back':
      if (state.step === 'passcode' && state.attemptId === 0) return { ...state, step: 'amount' };
      if (state.step === 'failure') return { ...state, step: 'passcode' };
      return state;
    case 'retry':
      return state.step === 'failure' ? { ...state, step: 'passcode' } : state;
    case 'show-receipt':
      return state.step === 'success' ? { ...state, step: 'receipt' } : state;
  }
}

export type PaymentAttemptResult =
  | { status: 'success' }
  | { status: 'failure' }
  | { status: 'ignored' };

export interface PaymentAttemptRunner {
  run(request: PaymentRequest, onPay: PaymentFlowProps['onPay']): Promise<PaymentAttemptResult>;
  invalidate(): void;
}

export function createPaymentAttemptRunner(): PaymentAttemptRunner {
  let generation = 0;
  let active: Promise<PaymentAttemptResult> | null = null;
  return {
    run(request, onPay) {
      if (active) return active;
      const attemptGeneration = generation;
      const snapshot = { ...request };
      // Defer the callback so even synchronous/reentrant calls share the active promise.
      const result = Promise.resolve()
        .then(async (): Promise<PaymentAttemptResult> => {
          if (attemptGeneration !== generation) return { status: 'ignored' };
          try {
            await onPay(snapshot);
            return { status: attemptGeneration === generation ? 'success' : 'ignored' };
          } catch {
            // Host errors can contain secrets. Only expose our own failure status.
            return { status: attemptGeneration === generation ? 'failure' : 'ignored' };
          }
        })
        .finally(() => {
          if (active === result) active = null;
        });
      active = result;
      return result;
    },
    invalidate() {
      generation += 1;
      active = null;
    },
  };
}
