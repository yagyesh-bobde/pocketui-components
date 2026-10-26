import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs, textParts } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface WaveTextProps extends AnimatedTextProps {
  duration?: number;
  amplitude?: number;
}

export function WaveText({ text, duration = 1400, amplitude = 5, style, testID }: WaveTextProps) {
  const motion = useTextMotion();
  const phase = useSharedValue(0);
  const words = useMemo(() => textParts(text, true), [text]);
  useEffect(() => {
    phase.set(0);
    if (motion)
      phase.set(
        withRepeat(
          withTiming(Math.PI * 2, {
            duration: animationMs(duration, 1400, 300),
            easing: Easing.linear,
          }),
          -1,
        ),
      );
    return () => cancelAnimation(phase);
  }, [motion, duration, phase]);
  const height = Number.isFinite(amplitude) ? Math.min(20, Math.max(0, amplitude)) : 5;
  let offset = 0;
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={text} testID={testID}>
      <View
        style={[styles.words, { paddingVertical: height }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {words.map(({ text: word, key }) => {
          const start = offset;
          const characters = textParts(word);
          offset += characters.length;
          return (
            <View key={key} style={styles.word}>
              {characters.map(({ text: character, index, key: characterKey }) => (
                <WaveCharacter
                  key={characterKey}
                  text={character}
                  index={start + index}
                  phase={phase}
                  amplitude={motion ? height : 0}
                  style={style}
                />
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function WaveCharacter({
  text,
  index,
  phase,
  amplitude,
  style,
}: AnimatedTextProps & { index: number; phase: SharedValue<number>; amplitude: number }) {
  const { colors } = useTheme();
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.sin(phase.value - index * 0.5) * amplitude }],
  }));
  return (
    <Animated.Text style={[styles.text, { color: colors.foreground }, style, animated]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap' },
  word: { flexDirection: 'row' },
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
