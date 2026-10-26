import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs, textCharacters } from './text-animation-utils';
import { theme, useTheme } from './theme';

export interface TypewriterProps extends AnimatedTextProps {
  /** Milliseconds per character. */
  speed?: number;
  delay?: number;
  cursor?: string;
}

export function Typewriter({
  text,
  style,
  testID,
  speed = 55,
  delay = 0,
  cursor = '|',
}: TypewriterProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const characters = useMemo(() => textCharacters(text), [text]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (!motion || characters.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    let next = 0;
    const tick = () => {
      next += 1;
      setCount(next);
      if (next < characters.length) timer = setTimeout(tick, animationMs(speed, 55, 16));
    };
    timer = setTimeout(tick, animationMs(delay, 0) + animationMs(speed, 55, 16));
    return () => clearTimeout(timer);
  }, [motion, characters, speed, delay]);
  const complete = !motion || count >= characters.length;
  return (
    <Text
      accessibilityLabel={text}
      testID={testID}
      style={[styles.text, { color: colors.foreground }, style]}
    >
      {complete ? text : characters.slice(0, count).join('') + cursor}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.semibold },
});
