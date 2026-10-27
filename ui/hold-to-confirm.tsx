import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useInteractionMotion } from './interaction-motion';
import { useTheme } from './theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCUMFERENCE = 2 * Math.PI * 22;
export interface HoldToConfirmProps {
  onConfirm: () => void;
  label?: string;
  completedLabel?: string;
  duration?: number;
  disabled?: boolean;
  testID?: string;
}
/** One confirmation per mount. Releasing early or leaving the app cancels the hold. */
export function HoldToConfirm({
  onConfirm,
  label = 'Hold to confirm',
  completedLabel = 'Confirmed',
  duration = 1400,
  disabled = false,
  testID,
}: HoldToConfirmProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const active = useRef(false);
  const done = useRef(false);
  const latest = useRef({ onConfirm, disabled });
  latest.current = { onConfirm, disabled };
  const [holding, setHolding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const delay = Number.isFinite(duration) ? Math.max(400, Math.min(10000, duration)) : 1400;
  const cancel = () => {
    active.current = false;
    clearTimeout(timer.current);
    progress.stopAnimation();
    progress.setValue(done.current ? 1 : 0);
    setHolding(false);
  };
  const complete = () => {
    if (done.current || latest.current.disabled || AppState.currentState !== 'active') return;
    done.current = true;
    active.current = false;
    clearTimeout(timer.current);
    progress.stopAnimation();
    progress.setValue(1);
    setHolding(false);
    setConfirmed(true);
    latest.current.onConfirm();
  };
  // Keep this subscription independent of a render's callback or animation preference.
  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') cancelRef.current();
    });
    return () => {
      clearTimeout(timer.current);
      progress.stopAnimation();
      listener.remove();
    };
  }, [progress]);
  useEffect(() => {
    if (disabled) cancelRef.current();
  }, [disabled]);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={confirmed ? completedLabel : label}
      accessibilityHint="Hold until the ring is full. With a screen reader, activate to confirm."
      accessibilityState={{ disabled: disabled || confirmed }}
      accessibilityActions={[{ name: 'activate', label: 'Confirm without holding' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') complete();
      }}
      onAccessibilityTap={complete}
      disabled={disabled || confirmed}
      onPressIn={() => {
        if (active.current || done.current || disabled) return;
        active.current = true;
        setHolding(true);
        progress.setValue(0);
        if (motion)
          Animated.timing(progress, {
            toValue: 1,
            duration: delay,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();
        timer.current = setTimeout(() => {
          if (active.current) complete();
        }, delay);
      }}
      onPressOut={cancel}
      pressRetentionOffset={0}
      style={[
        styles.button,
        {
          backgroundColor: confirmed ? colors.successSurface : colors.card,
          borderColor: confirmed ? colors.success : holding ? colors.mint : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <View style={styles.ring} accessible={false}>
        <Svg width={52} height={52} viewBox="0 0 52 52">
          <Circle cx={26} cy={26} r={22} stroke={colors.border} strokeWidth={3} fill="none" />
          <AnimatedCircle
            cx={26}
            cy={26}
            r={22}
            stroke={colors.mint}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={progress.interpolate({
              inputRange: [0, 1],
              outputRange: [CIRCUMFERENCE, 0],
            })}
            rotation={-90}
            origin="26, 26"
            strokeLinecap="round"
          />
        </Svg>
        <Text style={[styles.icon, { color: colors.mint }]}>{confirmed ? '✓' : '↑'}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {confirmed ? completedLabel : holding ? 'Keep holding…' : label}
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {confirmed
            ? 'All set. A little more intentional.'
            : holding
              ? 'Release to cancel'
              : `${(delay / 1000).toFixed(1)} seconds of intention`}
        </Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  ring: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  icon: { position: 'absolute', fontSize: 22, fontWeight: '500' },
  copy: { flex: 1, gap: 6 },
  title: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 11, lineHeight: 16 },
});
