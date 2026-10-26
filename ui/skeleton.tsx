import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, type DimensionValue, StyleSheet, View } from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  animate?: boolean;
}

/** Decorative placeholder. Wrap a group in SkeletonGroup for one loading announcement. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = theme.radius.md,
  animate = true,
}: SkeletonProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!motion || !animate) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [motion, animate, opacity]);
  return (
    <Animated.View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, borderRadius: radius, backgroundColor: colors.border, opacity }}
    />
  );
}

export function SkeletonGroup({
  children,
  label = 'Loading content',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={styles.group}
    >
      {children}
    </View>
  );
}

export function SkeletonText({
  lines = 3,
  lineHeight = 14,
  gap = 8,
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
}) {
  const count = Number.isFinite(lines) ? Math.max(1, Math.min(12, Math.trunc(lines))) : 3;
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index.toString()}
          height={lineHeight}
          width={index === count - 1 && count > 1 ? '65%' : '100%'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ group: { gap: theme.spacing.lg } });
