import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CIRCUMFERENCE = 2 * Math.PI * 48;
const TICK_LENGTH = Math.hypot(14, 14) + Math.hypot(28, 32);
/** This instance stays mounted across processing and success. */
export function PaymentMark({ success }: { success: boolean }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);
  const arc = useSharedValue(15 / 360);
  const fill = useSharedValue(0);
  const tick = useSharedValue(0);
  const scale = useSharedValue(1);
  const halo = useSharedValue(0);
  const flip = useSharedValue(0);
  useEffect(() => {
    const values = [rotation, arc, fill, tick, scale, halo, flip];
    for (const value of values) cancelAnimation(value);
    if (success) {
      if (reduced) {
        arc.value = 1;
        fill.value = 1;
        tick.value = 1;
        rotation.value = 0;
      } else {
        arc.value = withTiming(1, { duration: 220 });
        rotation.value = withTiming(Math.ceil(rotation.value / 360) * 360, { duration: 220 });
        fill.value = withDelay(220, withTiming(1, { duration: 130 }));
        scale.value = withDelay(
          220,
          withSequence(withTiming(1.2, { duration: 380 }), withTiming(1, { duration: 310 })),
        );
        halo.value = withDelay(220, withTiming(1, { duration: 230 }));
        flip.value = withDelay(
          350,
          withSequence(withTiming(-18, { duration: 230 }), withTiming(0, { duration: 400 })),
        );
        tick.value = withDelay(430, withTiming(1, { duration: 300, easing: Easing.linear }));
      }
    } else {
      fill.value = 0;
      tick.value = 0;
      halo.value = 0;
      if (reduced) {
        arc.value = 0.65;
        rotation.value = 0;
      } else {
        rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
        arc.value = withRepeat(
          withSequence(
            withTiming(290 / 360, { duration: 600 }),
            withTiming(15 / 360, { duration: 600 }),
          ),
          -1,
        );
      }
    }
    return () => {
      for (const value of values) cancelAnimation(value);
    };
  }, [success, reduced, rotation, arc, fill, tick, scale, halo, flip]);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - arc.value),
  }));
  const fillProps = useAnimatedProps(() => ({ opacity: fill.value }));
  const tickProps = useAnimatedProps(() => ({
    strokeDashoffset: TICK_LENGTH * (1 - tick.value),
    opacity: tick.value > 0 ? 1 : 0,
  }));
  const haloProps = useAnimatedProps(() => ({
    r: 55 + halo.value * 13,
    opacity: halo.value > 0 ? (1 - halo.value) * 0.4 : 0,
  }));
  const spin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: 1 - fill.value,
  }));
  const motion = useAnimatedStyle(() => ({
    transform: [{ perspective: 500 }, { scale: scale.value }, { rotateY: `${flip.value}deg` }],
  }));
  return (
    <Animated.View style={[styles.mark, motion]} accessible={false}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle
            cx={80}
            cy={80}
            r={48}
            fill="none"
            stroke={colors.successSurface}
            strokeWidth={8}
          />
          <AnimatedCircle
            cx={80}
            cy={80}
            r={48}
            fill="none"
            stroke={colors.mint}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
            animatedProps={ringProps}
          />
        </Svg>
      </Animated.View>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <AnimatedCircle cx={80} cy={80} fill={colors.mint} animatedProps={haloProps} />
        <AnimatedCircle
          cx={80}
          cy={80}
          r={48}
          fill={colors.successDepth}
          stroke={colors.successInk}
          strokeWidth={5}
          animatedProps={fillProps}
        />
        <AnimatedPath
          d="M59 80l14 14 28-32"
          fill="none"
          stroke={colors.successInk}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[TICK_LENGTH, TICK_LENGTH]}
          animatedProps={tickProps}
        />
      </Svg>
    </Animated.View>
  );
}
const styles = StyleSheet.create({ mark: { width: 160, height: 160, alignSelf: 'center' } });
