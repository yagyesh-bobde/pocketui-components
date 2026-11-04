import { useEffect, useRef } from 'react';
import {
  Animated,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

export type AnimatedBadgeVariant = 'success' | 'neutral' | 'warning' | 'danger';
export interface AnimatedBadgeProps {
  label: string;
  variant?: AnimatedBadgeVariant;
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

/** A status badge with a quiet halo; reduced motion and inactive apps keep a static dot. */
export function AnimatedBadge({
  label,
  variant = 'success',
  pulse = true,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}: AnimatedBadgeProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const color =
    variant === 'success'
      ? colors.success
      : variant === 'warning'
        ? colors.warning
        : variant === 'danger'
          ? colors.danger
          : colors.mutedForeground;

  useEffect(() => {
    progress.setValue(0);
    if (!pulse || !motion) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(0);
    };
  }, [pulse, motion, progress]);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={[
        styles.root,
        { backgroundColor: variant === 'success' ? colors.successSurface : colors.muted },
        style,
      ]}
    >
      <View style={styles.dotContainer} accessible={false}>
        {pulse && motion && (
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: color,
                opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
                transform: [
                  { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) },
                ],
              },
            ]}
          />
        )}
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <Text
        style={[
          styles.label,
          { color: variant === 'success' ? colors.success : colors.foreground },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  dotContainer: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: theme.fontWeight.medium },
});
