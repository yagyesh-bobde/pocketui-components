import { type ReactNode, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme';

export interface ImageComparisonProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  aspectRatio?: number;
  onPositionChange?: (position: number) => void;
  testID?: string;
}
/** Reveals two full-size surfaces by clipping, without resizing either image. */
export function ImageComparison({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initialPosition = 0.5,
  aspectRatio = 1,
  onPositionChange,
  testID,
}: ImageComparisonProps) {
  const { colors } = useTheme();
  const [position, setPosition] = useState(
    Number.isFinite(initialPosition) ? Math.max(0, Math.min(1, initialPosition)) : 0.5,
  );
  const [width, setWidth] = useState(0);
  const latest = useRef({ position, width, onPositionChange });
  latest.current = { position, width, onPositionChange };
  const start = useRef(0);
  const update = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    setPosition(next);
    latest.current.position = next;
    latest.current.onPositionChange?.(next);
  };
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        start.current = latest.current.position;
      },
      onPanResponderMove: (_, gesture) => {
        if (latest.current.width > 0) update(start.current + gesture.dx / latest.current.width);
      },
      onPanResponderTerminationRequest: () => true,
    }),
  ).current;
  return (
    <View testID={testID} style={styles.root}>
      <View
        {...responder.panHandlers}
        testID={testID ? `${testID}-surface` : undefined}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${beforeLabel} and ${afterLabel} comparison`}
        accessibilityHint="Swipe up or down to move the divider."
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(position * 100),
          text: `${Math.round(position * 100)} percent ${beforeLabel}`,
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') update(position + 0.1);
          if (event.nativeEvent.actionName === 'decrement') update(position - 0.1);
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={[
          styles.surface,
          {
            aspectRatio: Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1,
            backgroundColor: colors.muted,
          },
        ]}
      >
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={StyleSheet.absoluteFill}
        >
          {after}
        </View>
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.clip, { width: width * position }]}
        >
          <View style={{ width, height: '100%' }}>{before}</View>
        </View>
        <View pointerEvents="none" style={styles.labels}>
          <Text style={styles.label}>{beforeLabel}</Text>
          <Text style={styles.label}>{afterLabel}</Text>
        </View>
        <View pointerEvents="none" style={[styles.divider, { left: `${position * 100}%` }]}>
          <View
            style={[styles.handle, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={{ color: colors.foreground, fontSize: 18 }}>‹ ›</Text>
          </View>
        </View>
      </View>
      <View style={styles.controls}>
        {(
          [
            { label: beforeLabel, value: 1 },
            { label: 'Split', value: 0.5 },
            { label: afterLabel, value: 0 },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.value}
            testID={
              testID
                ? `${testID}-${item.value === 1 ? 'before' : item.value === 0 ? 'after' : 'split'}`
                : undefined
            }
            accessibilityRole="button"
            accessibilityLabel={`Show ${item.label}`}
            accessibilityState={{ selected: position === item.value }}
            onPress={() => update(item.value)}
            style={({ pressed }) => [
              styles.control,
              {
                backgroundColor: position === item.value ? colors.primary : colors.muted,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: position === item.value ? colors.primaryForeground : colors.foreground,
                fontSize: 12,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 16 },
  surface: { overflow: 'hidden', borderRadius: 24 },
  clip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  labels: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#fff',
    backgroundColor: '#00000066',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 10,
    letterSpacing: 1,
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { flexDirection: 'row', gap: 8 },
  control: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
