import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { adjacentRangeValue, normalizeRangeValue } from './range-slider-state';
import { useTheme } from './theme';

export { normalizeRangeValue } from './range-slider-state';

export interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  testID?: string;
}

/** A single-value slider with drag, precise step buttons and screen-reader adjustments. */
export function RangeSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = min,
  onValueChange,
  onSlidingComplete,
  label = 'Value',
  unit = '',
  disabled = false,
  testID,
}: RangeSliderProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState(defaultValue);
  const [width, setWidth] = useState(0);
  const current = normalizeRangeValue(value ?? local, min, max, step);
  const latest = useRef({
    current,
    min,
    max,
    step,
    width,
    disabled,
    value,
    onValueChange,
    onSlidingComplete,
  });
  latest.current = {
    current,
    min,
    max,
    step,
    width,
    disabled,
    value,
    onValueChange,
    onSlidingComplete,
  };
  const startX = useRef(0);
  const last = useRef(current);
  const change = (next: number, complete = false) => {
    const state = latest.current;
    if (state.disabled) return;
    const bounded = normalizeRangeValue(next, state.min, state.max, state.step);
    if (state.value === undefined) setLocal(bounded);
    if (bounded !== last.current) state.onValueChange?.(bounded);
    last.current = bounded;
    if (complete) state.onSlidingComplete?.(bounded);
  };
  const fromX = (x: number) => {
    const state = latest.current;
    if (state.width <= 24) return;
    change(
      state.min + Math.max(0, Math.min(1, (x - 12) / (state.width - 24))) * (state.max - state.min),
    );
  };
  const changeRef = useRef(change);
  const fromXRef = useRef(fromX);
  changeRef.current = change;
  fromXRef.current = fromX;
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled && latest.current.width > 24,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !latest.current.disabled && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (event) => {
        startX.current = event.nativeEvent.locationX;
        last.current = latest.current.current;
        fromXRef.current(startX.current);
      },
      onPanResponderMove: (_, gesture) => fromXRef.current(startX.current + gesture.dx),
      onPanResponderRelease: () => {
        if (!latest.current.disabled) latest.current.onSlidingComplete?.(last.current);
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        if (!latest.current.disabled) latest.current.onSlidingComplete?.(last.current);
      },
    }),
  );
  const adjust = (direction: -1 | 1) => {
    last.current = current;
    changeRef.current(adjacentRangeValue(current, direction, min, max, step), true);
  };
  const ratio = (current - min) / (max - min);
  return (
    <View testID={testID} style={[styles.root, { opacity: disabled ? 0.45 : 1 }]}>
      <View style={styles.heading}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.readout, { color: colors.foreground }]}>
          {current}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityHint="Swipe up or down to change the value."
        accessibilityState={{ disabled }}
        accessibilityValue={{ min, max, now: current, text: `${current}${unit ? ` ${unit}` : ''}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') adjust(1);
          if (event.nativeEvent.actionName === 'decrement') adjust(-1);
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.touchTrack}
        {...pan.panHandlers}
      >
        <View pointerEvents="none" style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: colors.primary }]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: Math.max(0, width - 24) * ratio,
              backgroundColor: colors.background,
              borderColor: colors.primary,
            },
          ]}
        />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.limit, { color: colors.mutedForeground }]}>
          {min}
          {unit ? ` ${unit}` : ''}
        </Text>
        <View style={styles.buttons}>
          {([-1, 1] as const).map((direction) => {
            const blocked = disabled || (direction < 0 ? current === min : current === max);
            return (
              <Pressable
                key={direction}
                accessibilityRole="button"
                accessibilityLabel={`${direction < 0 ? 'Decrease' : 'Increase'} ${label}`}
                accessibilityState={{ disabled: blocked }}
                disabled={blocked}
                onPress={() => adjust(direction)}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.muted, opacity: blocked ? 0.35 : pressed ? 0.65 : 1 },
                ]}
              >
                <Text style={{ color: colors.foreground, fontSize: 20 }}>
                  {direction < 0 ? '−' : '+'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.limit, { color: colors.mutedForeground }]}>
          {max}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  label: { flex: 1, fontSize: 14, fontWeight: '500' },
  readout: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  touchTrack: { height: 44, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  thumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderWidth: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  limit: { fontSize: 12 },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
});
