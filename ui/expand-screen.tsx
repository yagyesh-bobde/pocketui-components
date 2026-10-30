import { type ComponentRef, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  Modal,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useInteractionMotion } from './interaction-motion';
import { type ScreenOrigin, screenOrigin } from './screen-motion';
import { theme, useTheme } from './theme';

export type ExpandScreenOrigin = ScreenOrigin;

export interface ExpandScreenProps {
  readonly open: boolean;
  /** A trigger's measureInWindow rectangle. Coordinates are converted into modal space. */
  readonly origin?: ExpandScreenOrigin;
  readonly onClose: () => void;
  readonly onAfterClose?: () => void;
  readonly children: ReactNode;
  readonly duration?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}

/** Reveal a full-size screen through a growing rounded window. No navigator dependency. */
export function ExpandScreen({
  open,
  origin,
  onClose,
  onAfterClose,
  children,
  duration = 420,
  style,
  testID,
  accessibilityLabel = 'Expanded screen',
}: ExpandScreenProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const [present, setPresent] = useState(open);
  const [bounds, setBounds] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const root = useRef<ComponentRef<typeof View>>(null);
  const progress = useSharedValue(0);
  const desired = useRef(open);
  const afterClose = useRef(onAfterClose);
  const revision = useRef(0);
  desired.current = open;
  afterClose.current = onAfterClose;
  const source = screenOrigin(origin, bounds.width, bounds.height, bounds.x, bounds.y);
  const finishClose = useCallback((token: number) => {
    if (desired.current || token !== revision.current) return;
    setPresent(false);
    setBounds({ width: 0, height: 0, x: 0, y: 0 });
    afterClose.current?.();
  }, []);

  useEffect(() => {
    if (open) setPresent(true);
    else Keyboard.dismiss();
  }, [open]);
  useEffect(() => {
    if (!present || !bounds.width || !bounds.height) return;
    const token = ++revision.current;
    const milliseconds =
      motion && Number.isFinite(duration)
        ? Math.max(0, duration) * Math.abs((open ? 1 : 0) - progress.get())
        : 0;
    progress.set(
      withTiming(
        open ? 1 : 0,
        { duration: milliseconds, easing: Easing.bezier(0.2, 0.8, 0.2, 1) },
        (finished) => {
          if (finished && !open) scheduleOnRN(finishClose, token);
        },
      ),
    );
    return () => {
      revision.current += 1;
      cancelAnimation(progress);
    };
  }, [open, present, bounds.width, bounds.height, duration, motion, progress, finishClose]);

  const windowStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.get(), [0, 1], [source.x, 0]),
    top: interpolate(progress.get(), [0, 1], [source.y, 0]),
    width: interpolate(progress.get(), [0, 1], [source.width, bounds.width]),
    height: interpolate(progress.get(), [0, 1], [source.height, bounds.height]),
    borderRadius: source.radius * (1 - progress.get()),
    // Hand the source row back with the background, not just the destination content.
    opacity: interpolate(progress.get(), [0, 0.2, 1], [0, 0, 1]),
  }));
  const contentStyle = useAnimatedStyle(() => ({
    left: -interpolate(progress.get(), [0, 1], [source.x, 0]),
    top: -interpolate(progress.get(), [0, 1], [source.y, 0]),
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.get() * 0.35 }));

  return (
    <Modal
      visible={present}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
      onShow={() => AccessibilityInfo.announceForAccessibility(accessibilityLabel)}
    >
      <View
        ref={root}
        style={styles.root}
        onLayout={() =>
          root.current?.measureInWindow((x, y, width, height) =>
            setBounds((previous) =>
              previous.width === width &&
              previous.height === height &&
              previous.x === x &&
              previous.y === y
                ? previous
                : { x, y, width, height },
            ),
          )
        }
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.dark.background }, scrimStyle]}
        >
          <Pressable style={StyleSheet.absoluteFill} accessible={false} onPress={onClose} />
        </Animated.View>
        {bounds.width > 0 && bounds.height > 0 && (
          <Animated.View
            testID={testID}
            accessibilityViewIsModal
            style={[styles.window, { backgroundColor: colors.background }, windowStyle]}
          >
            <Animated.View
              style={[
                styles.content,
                { width: bounds.width, height: bounds.height },
                style,
                contentStyle,
              ]}
              pointerEvents={open ? 'auto' : 'none'}
            >
              {children}
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  window: { position: 'absolute', overflow: 'hidden' },
  content: { position: 'absolute' },
});
