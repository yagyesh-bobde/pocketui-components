import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInteractionMotion } from './interaction-motion';
import { clamp, sheetDestination, sheetSnapHeights } from './interaction-utils';
import { theme, useTheme } from './theme';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Fractions of the available height. The handle supports dragging and accessibility adjustment. */
  snapPoints?: readonly number[];
  initialSnapIndex?: number;
  dismissible?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  testID?: string;
}

const DEFAULT_SNAPS = [0.5, 0.9];

/** A controlled modal sheet. Drag only the handle so nested lists and text inputs keep their gestures. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  snapPoints = DEFAULT_SNAPS,
  initialSnapIndex = 0,
  dismissible = true,
  children,
  footer,
  testID,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const motion = useInteractionMotion();
  const availableHeight = Math.max(1, window.height - insets.top - 12);
  const snaps = useMemo(
    () => sheetSnapHeights(snapPoints, availableHeight),
    [snapPoints, availableHeight],
  );
  const initial =
    snaps[clamp(Math.trunc(initialSnapIndex), 0, snaps.length - 1)] ?? snaps[0] ?? 300;
  const height = useRef(new Animated.Value(initial)).current;
  const current = useRef(initial);
  const start = useRef(initial);
  const [snap, setSnap] = useState(initial);
  const [keyboard, setKeyboard] = useState(0);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    current.current = initial;
    setSnap(initial);
    height.setValue(initial);
    AccessibilityInfo.announceForAccessibility(title);
  }, [open, initial, height, title]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => setKeyboard(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboard(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const close = () => {
    if (dismissible) {
      Keyboard.dismiss();
      onOpenChange(false);
    }
  };
  const settle = (next: number) => {
    if (next === 0) {
      close();
      return;
    }
    current.current = next;
    setSnap(next);
    Animated.timing(height, {
      toValue: next,
      duration: motion ? 220 : 0,
      useNativeDriver: false,
    }).start();
  };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => {
      height.stopAnimation((value) => {
        start.current = value;
      });
    },
    onPanResponderMove: (_, gesture) =>
      height.setValue(
        clamp(
          start.current - gesture.dy,
          dismissible ? 60 : (snaps[0] ?? 100),
          snaps.at(-1) ?? 700,
        ),
      ),
    onPanResponderRelease: (_, gesture) =>
      settle(sheetDestination(start.current, gesture.dy, gesture.vy, snaps, dismissible)),
    onPanResponderTerminate: () => settle(current.current),
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType={motion ? 'fade' : 'none'}
      statusBarTranslucent
      onRequestClose={close}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.overlay} accessibilityViewIsModal onAccessibilityEscape={close}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss ${title}`}
          accessibilityState={{ disabled: !dismissible }}
          disabled={!dismissible}
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.keyboard}
        >
          <Animated.View
            testID={testID}
            style={[
              styles.sheet,
              {
                height,
                maxHeight: Math.max(1, availableHeight - (Platform.OS === 'ios' ? keyboard : 0)),
                backgroundColor: colors.card,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View
              {...pan.panHandlers}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel="Sheet height"
              accessibilityValue={{
                text: `${Math.round((snap / availableHeight) * 100)} percent`,
              }}
              accessibilityActions={[
                { name: 'increment', label: 'Expand' },
                { name: 'decrement', label: 'Collapse' },
              ]}
              onAccessibilityAction={(event) => {
                const index = snaps.indexOf(snap);
                const next = event.nativeEvent.actionName === 'increment' ? index + 1 : index - 1;
                if (next < 0) {
                  close();
                  return;
                }
                settle(snaps[Math.min(next, snaps.length - 1)] ?? initial);
              }}
              style={styles.handleArea}
              testID={testID ? `${testID}-handle` : undefined}
            >
              <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
            </View>
            <View style={styles.heading}>
              <View style={styles.headingText}>
                <Text
                  nativeID={titleId}
                  accessibilityRole="header"
                  style={[styles.title, { color: colors.foreground }]}
                >
                  {title}
                </Text>
                {description && (
                  <Text style={[styles.description, { color: colors.mutedForeground }]}>
                    {description}
                  </Text>
                )}
              </View>
              {dismissible && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Close ${title}`}
                  onPress={close}
                  style={[styles.close, { backgroundColor: colors.muted }]}
                  testID={testID ? `${testID}-close` : undefined}
                >
                  <Text style={{ color: colors.foreground, fontSize: 24 }}>×</Text>
                </Pressable>
              )}
            </View>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {children}
            </ScrollView>
            {footer && (
              <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  keyboard: { justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleArea: { height: 36, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 4, borderRadius: 2, opacity: 0.5 },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headingText: { flex: 1, gap: 6 },
  title: { fontSize: theme.fontSize.title, fontWeight: '600' },
  description: { fontSize: theme.fontSize.sm, lineHeight: 21 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 24, paddingTop: 16 },
});
