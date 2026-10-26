import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface ShimmerTextProps extends AnimatedTextProps {
  duration?: number;
}

/** A clipped second text layer supplies the light band without a mask or gradient dependency. */
export function ShimmerText({ text, duration = 1800, style, testID }: ShimmerTextProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(0);
    if (motion)
      progress.set(
        withRepeat(
          withTiming(1, { duration: animationMs(duration, 1800, 300), easing: Easing.linear }),
          -1,
        ),
      );
    return () => cancelAnimation(progress);
  }, [motion, duration, progress]);
  const band = Math.max(24, width * 0.25);
  const mask = useAnimatedStyle(() => ({
    transform: [{ translateX: -band + progress.value * (width + band) }],
  }));
  const copy = useAnimatedStyle(() => ({
    transform: [{ translateX: band - progress.value * (width + band) }],
  }));
  const typography = [styles.text, style];
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      testID={testID}
      style={styles.root}
    >
      <Text
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={[...typography, { color: colors.mutedForeground }]}
      >
        {text}
      </Text>
      {motion && width > 0 && (
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.mask, { width: band }, mask]}
        >
          <Animated.Text style={[...typography, { color: colors.foreground, width }, copy]}>
            {text}
          </Animated.Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'flex-start', overflow: 'hidden' },
  mask: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
