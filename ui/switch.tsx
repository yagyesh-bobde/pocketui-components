import { useEffect, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme, useTheme } from './theme';

const DURATION = 180;
const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const INSET = 2;
const THUMB = TRACK_HEIGHT - INSET * 2;
const TRAVEL = TRACK_WIDTH - THUMB - INSET * 2;

export interface SwitchProps {
  /** Controlled when passed. */
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** On/off toggle. Track color and thumb position animate on the UI thread. */
export function Switch({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: SwitchProps) {
  const { colors } = useTheme();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const checked = value ?? uncontrolled;
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(checked ? 1 : 0, { duration: DURATION }));
  }, [checked, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.mutedForeground, colors.primaryForeground],
    ),
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  const toggle = () => {
    const next = !checked;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={theme.spacing.sm}
      onPress={toggle}
      testID={testID}
      style={[disabled && styles.disabled, style]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    padding: INSET,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
