import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs, textParts } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface TextRevealProps extends AnimatedTextProps {
  duration?: number;
  stagger?: number;
  /** Fade only, rise into place, or grow into place. */
  variant?: 'fade' | 'slide' | 'scale';
}

export function TextReveal({
  text,
  style,
  testID,
  duration = 450,
  stagger = 75,
  variant = 'slide',
}: TextRevealProps) {
  const motion = useTextMotion();
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={text} testID={testID}>
      <View
        style={styles.words}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {textParts(text, true).map(({ key, text: word, index }) => (
          <RevealWord
            key={key}
            text={word}
            style={style}
            index={index}
            motion={motion}
            duration={duration}
            stagger={stagger}
            variant={variant}
          />
        ))}
      </View>
    </View>
  );
}

function RevealWord({
  text,
  style,
  index,
  motion,
  duration,
  stagger,
  variant,
}: TextRevealProps & { index: number; motion: boolean }) {
  const { colors } = useTheme();
  const progress = useSharedValue(1);
  useEffect(() => {
    progress.set(motion ? 0 : 1);
    if (motion) {
      progress.set(
        withDelay(
          Math.min(index * animationMs(stagger ?? 75, 75), 10_000),
          withTiming(1, {
            duration: animationMs(duration ?? 450, 450),
            easing: Easing.out(Easing.cubic),
          }),
        ),
      );
    }
    return () => cancelAnimation(progress);
  }, [motion, duration, stagger, index, progress]);
  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: variant === 'slide' ? (1 - progress.value) * 14 : 0 },
      { scale: variant === 'scale' ? 0.85 + progress.value * 0.15 : 1 },
    ],
  }));
  return (
    <Animated.Text style={[styles.text, { color: colors.foreground }, style, animated]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap' },
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
