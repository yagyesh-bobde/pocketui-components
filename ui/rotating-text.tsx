import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface RotatingTextProps extends Omit<AnimatedTextProps, 'text'> {
  texts: readonly string[];
  interval?: number;
  duration?: number;
}

export function RotatingText({
  texts,
  interval = 2400,
  duration = 350,
  style,
  testID,
}: RotatingTextProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const [index, setIndex] = useState(0);
  const content = JSON.stringify(texts);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset when phrase contents change, even with the same length.
  useEffect(() => {
    setIndex(0);
    if (!motion || texts.length < 2) return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % texts.length),
      Math.max(animationMs(interval, 2400, 250), animationMs(duration, 350) + 250),
    );
    return () => clearInterval(timer);
  }, [motion, content, texts.length, interval, duration]);
  const shown = motion ? index % Math.max(1, texts.length) : 0;
  const text = texts[shown] ?? '';
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      testID={testID}
      style={styles.clip}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.Text
          key={`${content}-${shown}-${motion}`}
          entering={motion ? FadeInDown.duration(animationMs(duration, 350)) : undefined}
          exiting={motion ? FadeOutUp.duration(animationMs(duration, 350)) : undefined}
          style={[styles.text, { color: colors.foreground }, style]}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', paddingVertical: theme.spacing.xs },
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
