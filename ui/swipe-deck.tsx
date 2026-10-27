import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { deckDirection } from './playful-utils';
import { theme, useTheme } from './theme';

export type SwipeDirection = 'left' | 'right';

export interface SwipeDeckProps<T> {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onSwipe?: (item: T, direction: SwipeDirection) => void;
  empty?: ReactNode;
  height?: number;
  leftLabel?: string;
  rightLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Changing the ordered keys starts a fresh deck. Change the React key to replay the same deck. */
export function SwipeDeck<T>(props: SwipeDeckProps<T>) {
  const keys = props.items.map(props.keyExtractor);
  if (new Set(keys).size !== keys.length) throw new Error('SwipeDeck needs unique item keys.');
  return <DeckSession key={JSON.stringify(keys)} {...props} />;
}

function DeckSession<T>({
  items,
  keyExtractor,
  renderCard,
  onSwipe,
  empty,
  height = 320,
  leftLabel = 'Pass',
  rightLabel = 'Keep',
  style,
  testID,
}: SwipeDeckProps<T>) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState(320);
  const locked = useRef(false);
  const offset = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const card = items[index];
  useEffect(() => () => animation.current?.stop(), []);
  const settle = () => {
    animation.current?.stop();
    animation.current = Animated.spring(offset, {
      toValue: 0,
      damping: 19,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    });
    if (motion) animation.current.start();
    else offset.setValue(0);
  };
  const dismiss = (direction: SwipeDirection) => {
    if (locked.current || card === undefined) return;
    locked.current = true;
    setBusy(true);
    animation.current?.stop();
    animation.current = Animated.timing(offset, {
      toValue: (direction === 'left' ? -1 : 1) * (width + 80),
      duration: motion ? 240 : 0,
      useNativeDriver: true,
    });
    animation.current.start(({ finished }) => {
      if (!finished) return;
      offset.setValue(0);
      setIndex((value) => value + 1);
      locked.current = false;
      setBusy(false);
      onSwipe?.(card, direction);
    });
  };
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !locked.current &&
      Math.abs(gesture.dx) > 10 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
    onPanResponderGrant: () => animation.current?.stop(),
    onPanResponderMove: (_, gesture) => {
      if (!locked.current) offset.setValue(gesture.dx);
    },
    onPanResponderRelease: (_, gesture) => {
      const direction = deckDirection(gesture.dx, gesture.vx, width);
      if (direction) dismiss(direction);
      else settle();
    },
    onPanResponderTerminate: settle,
    onPanResponderTerminationRequest: () => !locked.current,
  });
  const cardHeight = Number.isFinite(height) ? Math.max(160, Math.min(600, height)) : 320;
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={{ height: cardHeight + 24 }}>
        {card === undefined ? (
          <View style={[styles.empty, { height: cardHeight, borderColor: colors.border }]}>
            {empty ?? <Text style={{ color: colors.mutedForeground }}>All caught up.</Text>}
          </View>
        ) : (
          items.slice(index, index + 3).map((item, depth) => (
            <Animated.View
              key={keyExtractor(item)}
              {...(depth === 0 ? pan.panHandlers : {})}
              pointerEvents={depth === 0 && !busy ? 'auto' : 'none'}
              accessibilityElementsHidden={depth !== 0}
              importantForAccessibility={depth === 0 ? 'auto' : 'no-hide-descendants'}
              style={[
                styles.card,
                {
                  height: cardHeight,
                  zIndex: 3 - depth,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  transform:
                    depth === 0
                      ? [
                          { translateX: offset },
                          {
                            rotate: offset.interpolate({
                              inputRange: [-width, 0, width],
                              outputRange: ['-14deg', '0deg', '14deg'],
                              extrapolate: 'clamp',
                            }),
                          },
                        ]
                      : [{ translateY: depth * 10 }, { scale: 1 - depth * 0.045 }],
                },
              ]}
            >
              {renderCard(item)}
            </Animated.View>
          ))
        )}
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.counter, { color: colors.mutedForeground }]}
      >
        {Math.min(index + 1, items.length)} / {items.length}
        {card === undefined ? ' · Finished' : ''}
      </Text>
      <View style={styles.actions}>
        {(['left', 'right'] as const).map((direction) => (
          <Pressable
            key={direction}
            testID={testID ? `${testID}-${direction}` : undefined}
            accessibilityRole="button"
            disabled={busy || card === undefined}
            accessibilityState={{ disabled: busy || card === undefined }}
            onPress={() => dismiss(direction)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: direction === 'right' ? colors.primary : colors.muted,
                opacity: busy || card === undefined ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: direction === 'right' ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {direction === 'left' ? `← ${leftLabel}` : `${rightLabel} →`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  counter: { textAlign: 'center', fontSize: 11, fontVariant: ['tabular-nums'], letterSpacing: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    padding: 12,
  },
  buttonText: { fontSize: 14, fontWeight: '600' },
});
