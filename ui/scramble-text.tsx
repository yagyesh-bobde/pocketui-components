import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs, scrambleFrame, textCharacters } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface ScrambleTextProps extends AnimatedTextProps {
  duration?: number;
}

export function ScrambleText({ text, duration = 1000, style, testID }: ScrambleTextProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const characters = useMemo(() => textCharacters(text), [text]);
  const [frame, setFrame] = useState(text);
  useEffect(() => {
    if (!motion || characters.length === 0) {
      setFrame(text);
      return;
    }
    const start = Date.now();
    const length = animationMs(duration, 1000);
    let step = 0;
    setFrame(scrambleFrame(characters, 0, 0));
    const timer = setInterval(() => {
      const progress = length === 0 ? 1 : Math.min(1, (Date.now() - start) / length);
      setFrame(scrambleFrame(characters, progress, ++step));
      if (progress === 1) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [motion, characters, duration, text]);
  return (
    <Text
      accessibilityLabel={text}
      testID={testID}
      style={[styles.text, { color: colors.foreground }, style]}
    >
      {motion ? frame : text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSize.heading,
    fontWeight: theme.fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
});
