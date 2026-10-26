import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface HighlightTextProps extends AnimatedTextProps {
  duration?: number;
  delay?: number;
  color?: string;
}

export function HighlightText({
  text,
  duration = 700,
  delay = 150,
  color,
  style,
  testID,
}: HighlightTextProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const progress = useSharedValue(1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed message replays the sweep.
  useEffect(() => {
    progress.set(motion ? 0 : 1);
    if (motion)
      progress.set(
        withDelay(
          animationMs(delay, 150),
          withTiming(1, { duration: animationMs(duration, 700), easing: Easing.out(Easing.cubic) }),
        ),
      );
    return () => cancelAnimation(progress);
  }, [motion, text, duration, delay, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View testID={testID} style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[styles.highlight, { backgroundColor: color ?? colors.warning }, fill]}
      />
      <Text style={[styles.text, { color: colors.foreground }, style]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'flex-start' },
  highlight: {
    position: 'absolute',
    left: 0,
    bottom: 2,
    height: '35%',
    opacity: 0.35,
    borderRadius: theme.radius.sm,
  },
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
