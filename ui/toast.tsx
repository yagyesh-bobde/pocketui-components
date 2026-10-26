import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastDuration } from './interaction-utils';
import { theme, useTheme } from './theme';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  /** Milliseconds, 1–15 seconds. 0 stays until explicitly dismissed. */
  duration?: number;
  action?: { label: string; onPress: () => void };
}
interface ToastEntry extends ToastOptions {
  id: string;
}
export interface ToastController {
  toast: (options: ToastOptions) => string;
  /** Omit id to dismiss every toast. */
  dismiss: (id?: string) => void;
}
const ToastContext = createContext<ToastController | null>(null);

/** Place once around a screen or navigator; the host must have bounded height. */
export function ToastProvider({
  children,
  position = 'bottom',
}: {
  children: ReactNode;
  position?: 'top' | 'bottom';
}) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const insets = useSafeAreaInsets();
  const prefix = useId();
  const sequence = useRef(0);
  const dismiss = useCallback(
    (id?: string) => setItems((current) => (id ? current.filter((item) => item.id !== id) : [])),
    [],
  );
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `${prefix}-${++sequence.current}`;
      setItems((current) => [...current.slice(-2), { ...options, id }]);
      AccessibilityInfo.announceForAccessibility(
        [options.title, options.description].filter(Boolean).join('. '),
      );
      return id;
    },
    [prefix],
  );
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastContext value={value}>
      <View style={styles.root}>
        {children}
        <View
          pointerEvents="box-none"
          style={[
            styles.host,
            position === 'top' ? { top: insets.top + 12 } : { bottom: insets.bottom + 12 },
          ]}
        >
          {items.map((item) => (
            <ToastItem key={item.id} item={item} dismiss={dismiss} />
          ))}
        </View>
      </View>
    </ToastContext>
  );
}

export function useToast(): ToastController {
  const value = use(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider');
  return value;
}

function ToastItem({ item, dismiss }: { item: ToastEntry; dismiss: ToastController['dismiss'] }) {
  const { colors } = useTheme();
  const [held, setHeld] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [screenReader, setScreenReader] = useState(true);
  const remaining = useRef(toastDuration(item.duration));
  const selected = useRef(false);
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const app = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      changed = true;
      setScreenReader(enabled);
    });
    AccessibilityInfo.isScreenReaderEnabled().then(
      (enabled) => {
        if (mounted && !changed) setScreenReader(enabled);
      },
      () => {},
    );
    return () => {
      mounted = false;
      app.remove();
      reader.remove();
    };
  }, []);
  useEffect(() => {
    // Screen-reader users dismiss explicitly, so an action never disappears while being read.
    if (!active || held || screenReader || item.duration === 0) return;
    const started = Date.now();
    const timer = setTimeout(() => dismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [active, held, screenReader, item.id, item.duration, dismiss]);
  const accent =
    item.variant === 'success'
      ? colors.success
      : item.variant === 'error'
        ? colors.danger
        : colors.foreground;
  return (
    <View
      testID={`toast-${item.variant ?? 'default'}`}
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
      onTouchCancel={() => setHeld(false)}
      style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View
        accessible
        accessibilityLabel={[item.title, item.description].filter(Boolean).join('. ')}
        style={styles.message}
      >
        <Text style={[styles.title, { color: accent }]}>{item.title}</Text>
        {item.description && (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {item.description}
          </Text>
        )}
      </View>
      {item.action && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (selected.current) return;
            selected.current = true;
            dismiss(item.id);
            item.action?.onPress();
          }}
          style={styles.action}
          testID="toast-action"
        >
          <Text style={[styles.actionText, { color: colors.foreground }]}>{item.action.label}</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Dismiss ${item.title}`}
        hitSlop={4}
        onPress={() => dismiss(item.id)}
        style={styles.dismiss}
        testID="toast-dismiss"
      >
        <Text style={[styles.cross, { color: colors.mutedForeground }]}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    gap: 8,
    maxWidth: 480,
    width: 'auto',
    alignSelf: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  message: { flex: 1, gap: 4, paddingLeft: 4 },
  title: { fontSize: theme.fontSize.sm, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 19 },
  action: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  actionText: { fontSize: theme.fontSize.sm, fontWeight: '600' },
  dismiss: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cross: { fontSize: 24 },
});
