import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

export type LoaderVariant = 'spinner' | 'dots';
export interface LoaderProps {
  variant?: LoaderVariant;
  size?: number;
  color?: string;
  label?: string;
  showLabel?: boolean;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** An indeterminate spinner or three dots; motion pauses for reduced motion and inactive apps. */
export function Loader({
  variant = 'spinner',
  size = 24,
  color,
  label = 'Loading',
  showLabel = false,
  active = true,
  style,
  textStyle,
  testID,
}: LoaderProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const dimension = Number.isFinite(size) ? Math.max(12, Math.min(64, size)) : 24;
  const tint = color ?? colors.foreground;

  useEffect(() => {
    progress.setValue(0);
    if (!active || !motion) return;
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: variant === 'spinner' ? 900 : 1200,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(0);
    };
  }, [active, motion, variant, progress]);

  if (!active) return null;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      testID={testID}
      style={[styles.root, style]}
    >
      {variant === 'spinner' ? (
        <Animated.View
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: Math.max(2, dimension / 10),
            borderColor: colors.border,
            borderTopColor: tint,
            borderRightColor: tint,
            transform: [
              {
                rotate: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: dimension / 5,
            height: dimension,
          }}
        >
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                width: dimension / 3,
                height: dimension / 3,
                borderRadius: dimension / 6,
                backgroundColor: tint,
                opacity: motion
                  ? progress.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange:
                        index === 0
                          ? [1, 0.35, 0.35, 0.35, 1]
                          : index === 1
                            ? [0.35, 1, 0.35, 0.35, 0.35]
                            : [0.35, 0.35, 1, 0.35, 0.35],
                    })
                  : 1,
              }}
            />
          ))}
        </View>
      )}
      {showLabel && (
        <Text style={[styles.label, { color: colors.mutedForeground }, textStyle]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  label: { fontSize: theme.fontSize.sm },
});
