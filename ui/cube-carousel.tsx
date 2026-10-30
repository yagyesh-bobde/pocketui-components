import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useInteractionMotion } from './interaction-motion';
import { cubeLanding, pageIndex } from './screen-motion';
import { theme } from './theme';

export interface CubeCarouselItemInfo<T> {
  readonly item: T;
  readonly index: number;
  /** Only true for the settled page while the app is active. Drive media playback with this. */
  readonly isActive: boolean;
  readonly isAdjacent: boolean;
}

export interface CubeCarouselProps<T> {
  readonly data: readonly T[];
  readonly keyExtractor: (item: T) => string;
  readonly renderItem: (info: CubeCarouselItemInfo<T>) => ReactNode;
  readonly initialIndex?: number;
  /** Change this to navigate from buttons or another story selector. */
  readonly index?: number;
  readonly onIndexChange?: (index: number) => void;
  readonly onScrollStateChange?: (scrolling: boolean) => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}

/** A bounded, three-page story pager. The host owns video players and story progress. */
export function CubeCarousel<T>(props: CubeCarouselProps<T>) {
  const signature = JSON.stringify(props.data.map(props.keyExtractor));
  return <CubePager key={signature} {...props} />;
}

function CubePager<T>({
  data,
  keyExtractor,
  renderItem,
  initialIndex = 0,
  index: requestedIndex,
  onIndexChange,
  onScrollStateChange,
  style,
  testID,
  accessibilityLabel = 'Stories',
}: CubeCarouselProps<T>) {
  const motion = useInteractionMotion();
  const initial = pageIndex(requestedIndex ?? initialIndex, data.length);
  const [selected, setSelected] = useState(initial);
  const [moving, setMoving] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const environment = useRef({ width: 0, height: 0, active });
  const position = useSharedValue(initial);
  const settled = useSharedValue(initial);
  const start = useSharedValue(initial);
  const dragging = useSharedValue(false);
  const revision = useSharedValue(0);
  const callbacks = useRef({ onIndexChange, onScrollStateChange });
  callbacks.current = { onIndexChange, onScrollStateChange };
  const committed = useRef(initial);
  const echoedIndex = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  const notifyMoving = useCallback((value: boolean) => {
    if (!mounted.current) return;
    setMoving(value);
    callbacks.current.onScrollStateChange?.(value);
  }, []);
  const commit = useCallback(
    (next: number, token: number) => {
      // A new drag can start between the UI-thread landing and this RN callback.
      // Preserve that real landing while rejecting a cancelled or superseded one.
      if (!mounted.current || (token !== revision.get() && next !== settled.get())) return;
      const stillMoving = dragging.get() || Math.abs(position.get() - next) > 0.001;
      setSelected(next);
      setMoving(stillMoving);
      callbacks.current.onScrollStateChange?.(stillMoving);
      if (committed.current !== next) {
        committed.current = next;
        echoedIndex.current = next;
        callbacks.current.onIndexChange?.(next);
      }
    },
    [revision, settled, dragging, position],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setActive(state === 'active'),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      revision.set(revision.get() + 1);
      cancelAnimation(position);
    };
  }, [position, revision]);
  useEffect(() => {
    // Rotation or backgrounding cancels an in-flight drag at the last committed page.
    const previous = environment.current;
    if (
      previous.width === size.width &&
      previous.height === size.height &&
      previous.active === active
    )
      return;
    environment.current = { width: size.width, height: size.height, active };
    cancelAnimation(position);
    revision.set(revision.get() + 1);
    position.set(committed.current);
    settled.set(committed.current);
    dragging.set(false);
    notifyMoving(false);
  }, [size.width, size.height, active, dragging, notifyMoving, position, settled, revision]);

  useEffect(() => {
    if (requestedIndex === undefined || !size.width) return;
    const next = pageIndex(requestedIndex, data.length);
    if (next === echoedIndex.current) {
      echoedIndex.current = undefined;
      return;
    }
    echoedIndex.current = undefined;
    if (next === committed.current && position.get() === next && !dragging.get()) return;
    cancelAnimation(position);
    dragging.set(false);
    const token = revision.get() + 1;
    revision.set(token);
    if (!motion || Math.abs(next - committed.current) > 1) {
      position.set(next);
      settled.set(next);
      commit(next, token);
      return;
    }
    notifyMoving(true);
    position.set(
      withSpring(
        next,
        { damping: 28, stiffness: 240, mass: 1, overshootClamping: true },
        (finished) => {
          if (finished) {
            settled.set(next);
            scheduleOnRN(commit, next, token);
          }
        },
      ),
    );
  }, [
    requestedIndex,
    data.length,
    size.width,
    motion,
    commit,
    notifyMoving,
    position,
    settled,
    dragging,
    revision,
  ]);

  const gesture = Gesture.Pan()
    .enabled(data.length > 1 && size.width > 0 && active)
    .activeOffsetX([-10, 10])
    .failOffsetY([-14, 14])
    .onStart(() => {
      cancelAnimation(position);
      revision.set(revision.get() + 1);
      start.set(position.get());
      dragging.set(true);
      scheduleOnRN(notifyMoving, true);
    })
    .onUpdate((event) => {
      const lower = Math.max(0, settled.get() - 1);
      const upper = Math.min(data.length - 1, settled.get() + 1);
      position.set(Math.max(lower, Math.min(upper, start.get() - event.translationX / size.width)));
    })
    .onEnd((event) => {
      dragging.set(false);
      const next = cubeLanding(
        position.get(),
        -event.velocityX / size.width,
        settled.get(),
        data.length,
      );
      const token = revision.get();
      if (!motion) {
        position.set(next);
        settled.set(next);
        scheduleOnRN(commit, next, token);
      } else {
        position.set(
          withSpring(
            next,
            { damping: 28, stiffness: 240, mass: 1, overshootClamping: true },
            (finished) => {
              if (finished) {
                settled.set(next);
                scheduleOnRN(commit, next, token);
              }
            },
          ),
        );
      }
    })
    .onFinalize(() => {
      if (!dragging.get()) return;
      dragging.set(false);
      const next = settled.get();
      const token = revision.get();
      if (!motion) {
        position.set(next);
        scheduleOnRN(commit, next, token);
        return;
      }
      position.set(
        withSpring(next, { damping: 28, stiffness: 240, overshootClamping: true }, (finished) => {
          if (finished) scheduleOnRN(commit, next, token);
        }),
      );
    });

  const layout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setSize((previous) =>
      previous.width === width && previous.height === height ? previous : { width, height },
    );
  };
  const navigate = (direction: number) => {
    const next = pageIndex(committed.current + direction, data.length);
    if (next === committed.current) return;
    cancelAnimation(position);
    const token = revision.get() + 1;
    revision.set(token);
    dragging.set(false);
    position.set(next);
    settled.set(next);
    commit(next, token);
  };
  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: theme.dark.background }, style]}
    >
      <GestureDetector gesture={gesture}>
        <View onLayout={layout} testID={testID} style={styles.viewport}>
          {size.width > 0 &&
            data.map((item, index) =>
              Math.abs(index - selected) <= 1 ? (
                <CubePage
                  key={keyExtractor(item)}
                  index={index}
                  position={position}
                  width={size.width}
                  motion={motion}
                  active={index === selected && !moving && active}
                >
                  {renderItem({
                    item,
                    index,
                    isActive: index === selected && !moving && active,
                    isAdjacent: Math.abs(index - selected) === 1,
                  })}
                </CubePage>
              ) : null,
            )}
        </View>
      </GestureDetector>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{
          min: data.length ? 1 : 0,
          max: data.length,
          now: data.length ? selected + 1 : 0,
          text: data.length ? `Story ${selected + 1} of ${data.length}` : 'No stories',
        }}
        accessibilityActions={[
          { name: 'increment', label: 'Next story' },
          { name: 'decrement', label: 'Previous story' },
        ]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'increment') navigate(1);
          if (nativeEvent.actionName === 'decrement') navigate(-1);
        }}
        style={styles.accessiblePager}
      />
    </GestureHandlerRootView>
  );
}

function CubePage({
  index,
  position,
  width,
  motion,
  active,
  children,
}: {
  index: number;
  position: SharedValue<number>;
  width: number;
  motion: boolean;
  active: boolean;
  children: ReactNode;
}) {
  const face = useAnimatedStyle(() => {
    const delta = Math.max(-1, Math.min(1, index - position.get()));
    return {
      opacity: Math.abs(index - position.get()) >= 1 ? 0 : 1,
      transformOrigin: delta < 0 ? '100% 50%' : '0% 50%',
      transform: [
        { perspective: width * 3.4 },
        { translateX: delta * width },
        { rotateY: `${motion ? delta * 90 : 0}deg` },
      ],
    };
  });
  const shade = useAnimatedStyle(() => ({
    opacity: motion ? Math.min(1, Math.abs(index - position.get())) * 0.35 : 0,
  }));
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.face, face]}
      pointerEvents={active ? 'auto' : 'none'}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.dark.background }, shade]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  viewport: { flex: 1, overflow: 'hidden' },
  face: { backfaceVisibility: 'hidden' },
  accessiblePager: { position: 'absolute', top: 0, left: 0, width: 1, height: 1 },
});
