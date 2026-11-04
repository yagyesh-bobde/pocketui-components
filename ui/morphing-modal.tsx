import { type ComponentRef, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MorphingModalProps {
  trigger: ReactNode;
  children: ReactNode;
  accessibilityLabel: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  width?: number;
  sourceRadius?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Expand a measured card into a centered dialog, then return to the same card on dismissal. */
export function MorphingModal({
  trigger,
  children,
  accessibilityLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  width = 420,
  sourceRadius = 16,
  duration = 320,
  style,
  contentStyle,
  testID,
}: MorphingModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const motion = useInteractionMotion();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const desired = open ?? localOpen;
  const desiredRef = useRef(desired);
  desiredRef.current = desired;
  const mounted = useRef(true);
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const titleRef = useRef<ComponentRef<typeof Text>>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const [present, setPresent] = useState(false);
  const [origin, setOrigin] = useState<Rect | null>(null);
  const [bounds, setBounds] = useState<Rect | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const measureTrigger = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      if (!mounted.current || !desiredRef.current || measuredWidth <= 0 || measuredHeight <= 0)
        return;
      setOrigin({ x, y, width: measuredWidth, height: measuredHeight });
      setPresent(true);
    });
  }, []);
  useEffect(() => {
    if (desired && window.width > 0 && window.height > 0) measureTrigger();
    else if (!desired) Keyboard.dismiss();
  }, [desired, window.width, window.height, measureTrigger]);
  useEffect(() => {
    if (!present) return;
    if (!bounds || !contentHeight) {
      if (!desired) setPresent(false);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: desired ? 1 : 0,
      duration: motion
        ? Number.isFinite(duration)
          ? Math.max(0, Math.min(1000, duration))
          : 320
        : 0,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished && mounted.current && desiredRef.current) {
        const node = findNodeHandle(titleRef.current);
        if (node) AccessibilityInfo.setAccessibilityFocus(node);
      }
      if (finished && mounted.current && !desiredRef.current) {
        setPresent(false);
        setOrigin(null);
        setBounds(null);
        setContentHeight(0);
      }
    });
    return () => animation.stop();
  }, [desired, present, bounds, contentHeight, duration, motion, progress]);

  const changeOpen = (next: boolean) => {
    if (open === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };
  const close = () => changeOpen(false);
  const viewport = bounds ?? { x: 0, y: 0, width: window.width, height: window.height };
  const safeTop = Math.max(0, insets.top - viewport.y);
  const availableHeight = Math.max(80, viewport.height - safeTop - insets.bottom - 48);
  const targetWidth = Math.max(
    48,
    Math.min(Number.isFinite(width) ? width : 420, viewport.width - 48),
  );
  const targetHeight = Math.min(contentHeight || 80, availableHeight);
  const source = origin ?? { x: viewport.width / 2, y: viewport.height / 2, width: 48, height: 48 };
  const interpolate = (start: number, end: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [start, end] });

  return (
    <>
      <Pressable
        ref={triggerRef}
        collapsable={false}
        onLayout={() => {
          if (desired) measureTrigger();
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens a dialog"
        accessibilityState={{ expanded: desired, disabled }}
        accessibilityElementsHidden={present}
        importantForAccessibility={present ? 'no-hide-descendants' : 'auto'}
        disabled={disabled}
        testID={testID ? `${testID}-trigger` : undefined}
        onPress={() => changeOpen(true)}
        style={({ pressed }) => [{ opacity: present ? 0 : disabled ? 0.4 : pressed ? 0.8 : 1 }]}
      >
        {trigger}
      </Pressable>
      <Modal
        visible={present}
        transparent
        animationType="none"
        onRequestClose={close}
        supportedOrientations={['portrait', 'landscape']}
        onDismiss={() => {
          const node = findNodeHandle(triggerRef.current);
          if (node && !desiredRef.current) AccessibilityInfo.setAccessibilityFocus(node);
        }}
      >
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            ref={rootRef}
            style={styles.root}
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            onLayout={() =>
              rootRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
                if (mounted.current)
                  setBounds((previous) =>
                    previous?.x === x &&
                    previous.y === y &&
                    previous.width === measuredWidth &&
                    previous.height === measuredHeight
                      ? previous
                      : { x, y, width: measuredWidth, height: measuredHeight },
                  );
              })
            }
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: '#000000', opacity: interpolate(0, 0.3) },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                accessibilityRole="button"
                accessibilityLabel={`Close ${accessibilityLabel}`}
                onPress={close}
              />
            </Animated.View>
            <Animated.View
              pointerEvents={desired ? 'auto' : 'none'}
              testID={testID}
              style={[
                styles.window,
                { backgroundColor: colors.card, borderColor: colors.border },
                style,
                {
                  opacity: bounds ? 1 : 0,
                  left: interpolate(source.x - viewport.x, (viewport.width - targetWidth) / 2),
                  top: interpolate(
                    source.y - viewport.y,
                    safeTop + 24 + (availableHeight - targetHeight) / 2,
                  ),
                  width: interpolate(source.width, targetWidth),
                  height: interpolate(source.height, targetHeight),
                  borderRadius: interpolate(
                    Number.isFinite(sourceRadius) ? Math.max(0, sourceRadius) : 16,
                    24,
                  ),
                },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[
                  styles.source,
                  {
                    width: source.width,
                    height: source.height,
                    opacity: progress.interpolate({
                      inputRange: [0, 0.35, 1],
                      outputRange: [1, 0, 0],
                    }),
                  },
                ]}
              >
                {trigger}
              </Animated.View>
              <Animated.View
                onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
                style={{
                  width: targetWidth,
                  opacity: progress.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0, 1],
                  }),
                }}
              >
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                  <Text
                    ref={titleRef}
                    accessible
                    accessibilityRole="header"
                    style={[styles.title, { color: colors.foreground }]}
                  >
                    {accessibilityLabel}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Close ${accessibilityLabel}`}
                    onPress={close}
                    testID={testID ? `${testID}-close` : undefined}
                    hitSlop={8}
                    style={[styles.close, { backgroundColor: colors.muted }]}
                  >
                    <Text style={[styles.closeText, { color: colors.foreground }]}>×</Text>
                  </Pressable>
                </View>
                <ScrollView
                  style={{ maxHeight: Math.max(24, availableHeight - 64) }}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  contentContainerStyle={[styles.body, contentStyle]}
                >
                  {children}
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  window: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
  },
  source: { position: 'absolute', top: 0, left: 0, overflow: 'hidden' },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { flex: 1, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
  close: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  closeText: { fontSize: 22, lineHeight: 26 },
  body: { padding: 20, gap: theme.spacing.lg },
});
