import { type ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { createRulerScale } from './ruler-utils';
import { useTheme } from './theme';

const SPACING = 12;
export interface RulerPickerProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  unit?: string;
  disabled?: boolean;
  testID?: string;
}

/** A controlled, snapping ruler. Each step gets 12 points; the center stays fixed. */
export function RulerPicker({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  label,
  unit = '',
  disabled = false,
  testID,
}: RulerPickerProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const scale = useMemo(() => createRulerScale(min, max, step), [min, max, step]);
  const index = scale.indexOf(value);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const dragging = useRef(false);
  const last = useRef(-1);
  const layoutWidth = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(settle.current), []);
  const callback = useRef(onValueChange);
  callback.current = onValueChange;
  useEffect(() => {
    if (
      width > 0 &&
      (!dragging.current || disabled) &&
      (last.current !== index || layoutWidth.current !== width)
    ) {
      layoutWidth.current = width;
      last.current = Math.min(index, scale.count);
      scroll.current?.scrollTo({ x: index * SPACING, animated: false });
    }
  }, [index, width, scale, disabled]);
  useEffect(() => {
    if (disabled) dragging.current = false;
  }, [disabled]);
  const select = (next: number) => {
    const bounded = Math.max(0, Math.min(scale.count, next));
    clearTimeout(settle.current);
    dragging.current = false;
    last.current = bounded;
    scroll.current?.scrollTo({ x: bounded * SPACING, animated: motion });
    callback.current(scale.at(bounded));
  };
  return (
    <View testID={testID} style={[styles.root, { opacity: disabled ? 0.45 : 1 }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.readout}>
        <Text style={[styles.value, { color: colors.foreground }]}>{scale.at(index)}</Text>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityHint="Swipe up or down to adjust."
        accessibilityState={{ disabled }}
        accessibilityValue={{ min, max, now: scale.at(index), text: `${scale.at(index)} ${unit}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (disabled) return;
          if (event.nativeEvent.actionName === 'increment') select(index + 1);
          if (event.nativeEvent.actionName === 'decrement') select(index - 1);
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.track}
      >
        {width > 0 && (
          <ScrollView
            ref={scroll}
            horizontal
            scrollEnabled={!disabled}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SPACING}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{ paddingHorizontal: Math.max(0, (width - SPACING) / 2) }}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              clearTimeout(settle.current);
              dragging.current = true;
            }}
            onScroll={(event) => {
              if (!dragging.current || disabled) return;
              const next = Math.max(
                0,
                Math.min(scale.count, Math.round(event.nativeEvent.contentOffset.x / SPACING)),
              );
              if (next !== last.current) {
                last.current = next;
                callback.current(scale.at(next));
              }
            }}
            onMomentumScrollBegin={() => {
              clearTimeout(settle.current);
            }}
            onMomentumScrollEnd={() => {
              dragging.current = false;
            }}
            onScrollEndDrag={() => {
              clearTimeout(settle.current);
              settle.current = setTimeout(() => {
                dragging.current = false;
              }, 120);
            }}
          >
            {Array.from({ length: scale.count + 1 }, (_, tick) => (
              <View key={scale.at(tick)} accessible={false} style={styles.tickCell}>
                <View
                  style={{
                    width: 1,
                    height: tick % 5 === 0 ? 36 : 18,
                    backgroundColor: colors.mutedForeground,
                  }}
                />
                {tick % 5 === 0 && (
                  <Text style={[styles.tickText, { color: colors.mutedForeground }]}>
                    {scale.at(tick)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
        <View pointerEvents="none" style={[styles.needle, { backgroundColor: colors.mint }]} />
      </View>
      <View style={styles.controls}>
        {([-1, 1] as const).map((direction) => (
          <Pressable
            key={direction}
            testID={testID ? `${testID}-${direction === -1 ? 'decrease' : 'increase'}` : undefined}
            accessibilityRole="button"
            accessibilityLabel={`${direction === -1 ? 'Decrease' : 'Increase'} ${label}`}
            disabled={disabled || (direction === -1 ? index === 0 : index === scale.count)}
            onPress={() => select(index + direction)}
            style={({ pressed }) => [
              styles.control,
              {
                backgroundColor: colors.muted,
                opacity:
                  disabled || (direction === -1 ? index === 0 : index === scale.count)
                    ? 0.3
                    : pressed
                      ? 0.6
                      : 1,
              },
            ]}
          >
            <Text style={{ color: colors.foreground, fontSize: 22 }}>
              {direction === -1 ? '−' : '+'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 20, paddingVertical: 24 },
  label: { fontSize: 11, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase' },
  readout: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8 },
  value: { fontSize: 68, fontWeight: '500', letterSpacing: -3, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 16 },
  track: { height: 82, overflow: 'hidden' },
  tickCell: { width: SPACING, alignItems: 'center', gap: 12 },
  tickText: { fontSize: 8, width: 38, textAlign: 'center' },
  needle: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 2,
    height: 44,
    marginLeft: -1,
    borderRadius: 1,
  },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  control: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
