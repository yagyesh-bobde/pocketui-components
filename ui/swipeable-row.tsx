import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  I18nManager,
  PanResponder,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { clamp, swipeDestination } from './interaction-utils';
import { theme, useTheme } from './theme';

export interface SwipeableAction {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}
export interface SwipeableRowProps {
  children: ReactNode;
  actions: readonly SwipeableAction[];
  /** Accessible summary for the row. Actions are also exposed without a swipe. */
  accessibilityLabel: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  actionWidth?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Reveal trailing actions; full swipes never execute destructive actions automatically. */
export function SwipeableRow({
  children,
  actions,
  accessibilityLabel,
  open: controlled,
  onOpenChange,
  actionWidth = 80,
  style,
  testID,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const [localOpen, setLocalOpen] = useState(false);
  const [measured, setMeasured] = useState(320);
  const open = controlled ?? localOpen;
  const shown = actions.slice(0, 3);
  const width = Math.min(
    shown.length * (Number.isFinite(actionWidth) ? clamp(actionWidth, 64, 120) : 80),
    measured * 0.85,
  );
  const offset = useRef(new Animated.Value(0)).current;
  const current = useRef(0);
  const start = useRef(0);
  const rtl = I18nManager.isRTL ? -1 : 1;
  useEffect(() => {
    const id = offset.addListener(({ value }) => {
      current.current = value;
    });
    return () => offset.removeListener(id);
  }, [offset]);
  useEffect(() => {
    const animation = Animated.timing(offset, {
      toValue: open ? -width : 0,
      duration: motion ? 220 : 0,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [open, width, motion, offset]);
  const change = (next: boolean) => {
    if (controlled === undefined) setLocalOpen(next);
    onOpenChange?.(next);
    Animated.timing(offset, {
      toValue: (controlled === undefined ? next : controlled) ? -width : 0,
      duration: motion ? 220 : 0,
      useNativeDriver: true,
    }).start();
  };
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      shown.length > 0 &&
      Math.abs(gesture.dx) > 10 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => {
      start.current = current.current;
      offset.stopAnimation((value) => {
        start.current = value;
      });
    },
    onPanResponderMove: (_, gesture) =>
      offset.setValue(clamp(start.current + gesture.dx * rtl, -width, 0)),
    onPanResponderRelease: (_, gesture) =>
      change(swipeDestination(start.current + gesture.dx * rtl, gesture.vx * rtl, width) !== 0),
    onPanResponderTerminate: () => change(open),
  });
  return (
    <View
      onLayout={(event) => setMeasured(event.nativeEvent.layout.width)}
      style={[styles.root, { backgroundColor: colors.muted }, style]}
      testID={testID}
    >
      <View
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
        style={[styles.actions, { width, [I18nManager.isRTL ? 'left' : 'right']: 0 }]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        {shown.map((action) => (
          <Pressable
            key={action.key}
            testID={testID ? `${testID}-${action.key}` : undefined}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => {
              change(false);
              action.onPress();
            }}
            style={[
              styles.action,
              { backgroundColor: action.destructive ? colors.danger : colors.primary },
            ]}
          >
            <Text
              style={[
                styles.actionText,
                { color: action.destructive ? colors.dangerForeground : colors.primaryForeground },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Animated.View
        {...pan.panHandlers}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Swipe to reveal actions, or use accessibility actions"
        accessibilityActions={[
          ...shown.map((action) => ({ name: action.key, label: action.label })),
          { name: 'toggle', label: open ? 'Hide actions' : 'Show actions' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'toggle') change(!open);
          else {
            const action = shown.find((entry) => entry.key === event.nativeEvent.actionName);
            if (action) {
              change(false);
              action.onPress();
            }
          }
        }}
        style={[
          styles.content,
          {
            backgroundColor: colors.card,
            transform: [{ translateX: Animated.multiply(offset, rtl) }],
          },
        ]}
      >
        <View style={styles.body}>{children}</View>
        {shown.length > 0 && (
          <Pressable
            testID={testID ? `${testID}-toggle` : undefined}
            accessibilityRole="button"
            accessibilityLabel={open ? 'Hide actions' : 'Show actions'}
            onPress={() => change(!open)}
            style={styles.toggle}
          >
            <Text style={[styles.dots, { color: colors.mutedForeground }]}>···</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: theme.radius.lg, overflow: 'hidden' },
  actions: { position: 'absolute', top: 0, bottom: 0, flexDirection: 'row' },
  action: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    minHeight: 44,
  },
  actionText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', minHeight: 80 },
  body: { flex: 1, padding: 16 },
  toggle: { width: 44, minHeight: 60, alignItems: 'center', justifyContent: 'center' },
  dots: { fontSize: 24, fontWeight: '700' },
});
