import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';
import { PaymentIcon } from './icons';

const KNOB = 68;
export function SlideToPay({ enabled, onComplete }: { enabled: boolean; onComplete: () => void }) {
  const { colors, fontSize, fontWeight } = useTheme();
  const travel = useSharedValue(0);
  const position = useSharedValue(0);
  const completed = useSharedValue(false);
  const start = useSharedValue(0);
  const delivered = useRef(false);
  const complete = () => {
    if (!delivered.current && enabled) {
      delivered.current = true;
      onComplete();
    }
  };
  useEffect(() => () => cancelAnimation(position), [position]);
  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX(5)
    .failOffsetY([-12, 12])
    .onStart(() => {
      cancelAnimation(position);
      start.value = position.value;
    })
    .onUpdate((event) => {
      if (!completed.value)
        position.value = Math.max(0, Math.min(travel.value, start.value + event.translationX));
    })
    .onEnd(() => {
      if (!completed.value && travel.value > 0 && position.value >= travel.value) {
        completed.value = true;
        runOnJS(complete)();
      }
    })
    .onFinalize(() => {
      if (!completed.value)
        position.value = withTiming(0, { duration: 430, easing: Easing.inOut(Easing.cubic) });
    });
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: position.value }] }));
  const fill = useAnimatedStyle(() => ({
    width: position.value + KNOB,
    opacity: travel.value ? position.value / travel.value : 0,
  }));
  const label = useAnimatedStyle(() => ({
    opacity: travel.value ? 1 - position.value / travel.value : 1,
  }));
  return (
    <View style={styles.group}>
      <View
        testID="payment-slide"
        onLayout={(event) => {
          travel.value = Math.max(0, event.nativeEvent.layout.width - KNOB - 8);
        }}
        style={[
          styles.track,
          { backgroundColor: colors.muted, borderColor: colors.border, opacity: enabled ? 1 : 0.5 },
        ]}
      >
        <Animated.View pointerEvents="none" style={[styles.fill, fill]}>
          <Svg width="100%" height="100%" accessible={false}>
            <Defs>
              <LinearGradient id="payment-trail" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.successSurface} />
                <Stop offset="1" stopColor={colors.mint} stopOpacity={0.8} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#payment-trail)" />
          </Svg>
        </Animated.View>
        <Animated.Text
          pointerEvents="none"
          style={[
            styles.label,
            { color: colors.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
            label,
          ]}
        >
          Slide to continue
        </Animated.Text>
        <GestureDetector gesture={gesture}>
          <Animated.View
            accessible={false}
            style={[styles.knob, { backgroundColor: colors.primary }, knob]}
          >
            <PaymentIcon kind="arrow" color={colors.primaryForeground} />
          </Animated.View>
        </GestureDetector>
      </View>
      <Pressable
        testID="payment-continue-without-sliding"
        accessibilityRole="button"
        accessibilityLabel="Continue to app passcode without dragging"
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        onPress={complete}
        style={styles.alternative}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
          Continue without sliding
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 2 },
  track: {
    height: 54,
    borderWidth: 1,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 28 },
  knob: {
    position: 'absolute',
    left: 3,
    width: KNOB,
    height: 46,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center', paddingLeft: 40 },
  alternative: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
