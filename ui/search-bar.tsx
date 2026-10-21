import {
  type ComponentRef,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { theme, useTheme } from './theme';

/** The system Reduce Motion setting, live (Reanimated's hook is a launch-time snapshot). */
function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => live && setEnabled(value));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return enabled;
}

const HEIGHT = 48;
const ICON = 20;
/** Android's AccelerateDecelerateInterpolator: 0.5 - cos(πt) / 2. */
const EASING = Easing.inOut(Easing.sin);
/** Rows sit 1.2 field heights apart, so the two lines never touch while they slide. */
const OFFSET = 1.2;

type TextInputRef = ComponentRef<typeof TextInput>;

export interface SearchBarProps extends Omit<TextInputProps, 'placeholder' | 'style'> {
  /** Full placeholder strings, e.g. `Search "noodles"`. They cycle while the bar is empty. */
  placeholders: readonly string[];
  /** Ms from one placeholder change to the next, slide included. */
  interval?: number;
  /** Ms for the slide: the old line moves up and out while the next moves up in. */
  duration?: number;
  /** Left of the text. Defaults to a search icon; pass `null` for none. */
  leading?: ReactNode;
  /** Right of the text, e.g. a divider and a mic, or a clear button. */
  trailing?: ReactNode;
  /** Style of the bar. */
  style?: StyleProp<ViewStyle>;
  ref?: Ref<TextInputRef>;
}

/**
 * Search field whose placeholder slides up and out while the next one slides up in from below.
 * Cycling pauses while focused and the placeholder hides once there is text.
 */
export function SearchBar({
  placeholders,
  interval = 3400,
  duration = 1000,
  leading,
  trailing,
  style,
  ref,
  value,
  defaultValue = '',
  onChangeText,
  onFocus,
  onBlur,
  editable = true,
  placeholderTextColor,
  accessibilityLabel = 'Search',
  ...props
}: SearchBarProps) {
  const { colors, scheme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  // Completed placeholder changes. Two slots take turns: only the hidden one's text changes.
  const [count, setCount] = useState(0);
  const text = value ?? uncontrolled;
  const empty = text.length === 0;
  const cycling = empty && !focused && placeholders.length > 1;

  // Slot offsets in field heights: 0 shown, -OFFSET above, OFFSET below (both clipped).
  const first = useSharedValue(0);
  const second = useSharedValue(OFFSET);
  const height = useSharedValue(HEIGHT);
  const firstStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: first.value * height.value }],
  }));
  const secondStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: second.value * height.value }],
  }));

  useEffect(() => {
    if (!cycling) return;
    const leg = reduceMotion ? 0 : duration;
    const [shown, next] = count % 2 === 0 ? [first, second] : [second, first];
    const slide = () => {
      shown.set(withTiming(-OFFSET, { duration: leg, easing: EASING }));
      next.set(
        withTiming(0, { duration: leg, easing: EASING }, (finished) => {
          'worklet';
          if (!finished) return;
          shown.set(OFFSET); // Park the old line below, out of sight, for its next turn.
          scheduleOnRN(setCount, count + 1);
        }),
      );
    };
    const timer = setTimeout(slide, Math.max(0, interval - leg));
    return () => clearTimeout(timer);
  }, [cycling, count, interval, duration, reduceMotion, first, second]);

  useEffect(
    () => () => {
      cancelAnimation(first);
      cancelAnimation(second);
    },
    [first, second],
  );

  const inputRef = useRef<TextInputRef>(null);
  const setInputRef = useCallback(
    (node: TextInputRef | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Slot `parity` shows the phrase of the next count with that parity: the current one or the next.
  const slot = (animatedStyle: typeof firstStyle, parity: number) => (
    <Animated.View style={[styles.slot, animatedStyle]}>
      <Text
        numberOfLines={1}
        style={[styles.text, { color: placeholderTextColor ?? colors.mutedForeground }]}
      >
        {placeholders[(count + ((count + parity) % 2)) % placeholders.length]}
      </Text>
    </Animated.View>
  );

  return (
    <Pressable
      accessible={false}
      disabled={!editable}
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.bar,
        {
          // Light: white bar on a gray border. Dark: muted fill, since muted === border.
          backgroundColor: scheme === 'dark' ? colors.muted : colors.background,
          borderColor: focused ? colors.mutedForeground : colors.border,
        },
        !editable && styles.disabled,
        style,
      ]}
    >
      {leading === undefined ? <SearchIcon color={colors.primary} /> : leading}
      <View style={styles.field} onLayout={(event) => height.set(event.nativeEvent.layout.height)}>
        {empty && placeholders.length > 0 && (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={StyleSheet.absoluteFill}
          >
            {slot(firstStyle, 0)}
            {slot(secondStyle, 1)}
          </View>
        )}
        <TextInput
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="search"
          returnKeyType="search"
          selectionColor={colors.foreground}
          cursorColor={colors.foreground}
          {...props}
          ref={setInputRef}
          editable={editable}
          value={text}
          onChangeText={(next) => {
            if (value === undefined) setUncontrolled(next);
            onChangeText?.(next);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.text, styles.input, { color: colors.foreground }]}
        />
      </View>
      {trailing}
    </Pressable>
  );
}

/** Magnifier drawn with Views: a ring and a 45° handle. */
function SearchIcon({ color }: { color: string }) {
  return (
    <View style={styles.icon}>
      <View style={[styles.iconRing, { borderColor: color }]} />
      <View style={[styles.iconHandle, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    height: HEIGHT,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  field: {
    flex: 1,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  slot: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.fontSize.md,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  icon: {
    width: ICON,
    height: ICON,
  },
  iconRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
  },
  iconHandle: {
    position: 'absolute',
    top: 11.5,
    left: 14,
    width: 2,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
