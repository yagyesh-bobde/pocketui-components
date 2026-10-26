import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { type AnimatedTextProps, useTextMotion } from './text-animation';
import { animationMs } from './text-animation-utils';
import { theme, useTheme } from './theme';

const defaultFormat = (value: number) => Math.round(value).toLocaleString();

export interface NumberTickerProps extends Omit<AnimatedTextProps, 'text'> {
  value: number;
  from?: number;
  duration?: number;
  format?: (value: number) => string;
}

export function NumberTicker({
  value,
  from = 0,
  duration = 1200,
  format = defaultFormat,
  style,
  testID,
}: NumberTickerProps) {
  const { colors } = useTheme();
  const motion = useTextMotion();
  const target = Number.isFinite(value) ? value : 0;
  const startValue = Number.isFinite(from) ? from : 0;
  const [current, setCurrent] = useState(startValue);
  useEffect(() => {
    const length = animationMs(duration, 1200);
    if (!motion || length === 0) {
      setCurrent(target);
      return;
    }
    setCurrent(startValue);
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / length);
      setCurrent(startValue + (target - startValue) * (1 - (1 - progress) ** 3));
      if (progress === 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, [motion, target, startValue, duration]);
  return (
    <Text
      accessibilityLabel={format(target)}
      testID={testID}
      style={[styles.text, { color: colors.foreground }, style]}
    >
      {format(motion ? current : target)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
});
