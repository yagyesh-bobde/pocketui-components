import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** The system Reduce Motion setting, live (Reanimated's hook is a launch-time snapshot). */
function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => live && setEnabled(value));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return enabled;
}

const DURATION = 450;
const INTERVAL = 3500;
/** Android's AccelerateDecelerateInterpolator: 0.5 - cos(πt) / 2. */
const SLIDE_EASING = Easing.inOut(Easing.sin);
/** `onIndexChange` fires this far into a slide, so an overlaid header can tint before landing. */
const INDEX_CHANGE_AT = 0.95;

/** Dot sizes by distance from the selected dot: selected and neighbours, small, tiny, hidden. */
const DOT = 6;
const DOT_SMALL = 4.5;
const DOT_TINY = 2;
const DOT_GAP = 5;
const DOT_PITCH = DOT + DOT_GAP;
const DOT_DURATION = 200;
/** Android's DecelerateInterpolator (factor 1). */
const DOT_EASING = Easing.out(Easing.quad);

export interface HeroCarouselItemInfo<T> {
  item: T;
  index: number;
  /** The carousel has settled on this page. Start one-shot sequences here. */
  isActive: boolean;
  /**
   * One swipe away from the active page on either side (wrapping), so a drag can bring it on
   * screen. Keep looping motion running here so a page is never caught frozen mid-swipe.
   */
  isAdjacent: boolean;
}

export interface HeroCarouselProps<T> {
  data: readonly T[];
  renderItem: (info: HeroCarouselItemInfo<T>) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  /** Advance on its own. Off under reduced motion. */
  autoplay?: boolean;
  /** Ms a page rests after landing before the next slide starts. */
  interval?: number;
  /** Ms of one autoplay slide. */
  duration?: number;
  /** Stop autoplay for good after the first touch, instead of restarting the rest after it. */
  stopAutoplayOnInteraction?: boolean;
  /** Page width. Defaults to the carousel's own width. */
  width?: number;
  /** Called with the page about to land, 95% of the way into a slide (autoplay or drag). */
  onIndexChange?: (index: number) => void;
  /** Overflow dots over the bottom of the pages. */
  indicator?: boolean;
  /** Dots that fit the indicator's clip window; the ones past its edges shrink out. */
  visibleDots?: number;
  dotColor?: string;
  inactiveDotColor?: string;
  indicatorStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface Move {
  index: number;
  /** -1, 0 or 1 pages, so the dots know which way their row scrolls. */
  step: number;
  /** `Date.now()` of the landing, so the rest is counted from it rather than from the render. */
  at: number;
}

/**
 * Full-bleed pager that autoplays forward forever (the last page slides on to the first), with
 * native 1:1 drags that snap to a page, and an overflow dot indicator. The slide and the dots run
 * on the UI thread with Reanimated.
 */
export function HeroCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  autoplay = true,
  interval = INTERVAL,
  duration = DURATION,
  stopAutoplayOnInteraction = false,
  width: widthProp,
  onIndexChange,
  indicator = true,
  visibleDots = 5,
  dotColor = '#ffffff',
  inactiveDotColor = 'rgba(255, 255, 255, 0.5)',
  indicatorStyle,
  style,
  testID,
}: HeroCarouselProps<T>) {
  const reduceMotion = useReduceMotion();
  const count = data.length;
  const [measured, setMeasured] = useState(0);
  const width = widthProp ?? measured;
  const ref = useAnimatedRef<Animated.ScrollView>();
  const [move, setMove] = useState<Move>(() => ({ index: 0, step: 0, at: Date.now() }));
  const active = Math.min(move.index, Math.max(count - 1, 0));
  const activeRef = useRef(active);
  activeRef.current = active;
  const [touching, setTouching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  /** When autoplay last became possible; the rest is counted from here or the landing, whichever is later. */
  const [restFrom, setRestFrom] = useState(0);

  // A new `autoplay` value starts over after `stopAutoplayOnInteraction` stopped it.
  const [lastAutoplay, setLastAutoplay] = useState(autoplay);
  if (lastAutoplay !== autoplay) {
    setLastAutoplay(autoplay);
    setStopped(false);
  }

  // Slots: 0 = clone of the last page, 1..count = pages, count + 1 = clone of the first page.
  // Landing on a clone jumps to its page, so the wrap is a plain forward (or backward) slide.
  const wrap = count > 1;
  const pageWidth = useSharedValue(0);
  /** Content offset while a slide is driven (autoplay); at rest, the settled slot's offset. */
  const offset = useSharedValue(0);
  /** Offset of the slot last landed on, so a landing knows how far it moved. */
  const settled = useSharedValue(0);
  /** A finger drag is in progress or settling. Programmatic scrolls never set it. */
  const userScroll = useSharedValue(false);
  /** The finger is still down. Android reports the cancelled snap's momentum end during it. */
  const fingerDown = useSharedValue(false);
  const shown = useSharedValue(0);

  useAnimatedReaction(
    () => offset.value,
    (x, previous) => {
      if (previous !== null && x !== previous) scrollTo(ref, x, 0, false);
    },
    [ref],
  );

  // `touching` is cleared by the touch end/cancel only, so a finger resting on a page keeps
  // autoplay paused after a drag has settled.
  const settle = useCallback((index: number, step: number) => {
    setMove({ index, step, at: Date.now() });
    setDragging(false);
  }, []);

  const land = useCallback(
    (slot: number) => {
      'worklet';
      const w = pageWidth.value;
      const from = Math.round(settled.value / w);
      let to = slot;
      if (to === count + 1) {
        to = 1;
        scrollTo(ref, w, 0, false);
      } else if (to === 0) {
        to = count;
        scrollTo(ref, count * w, 0, false);
      }
      userScroll.value = false;
      offset.value = to * w;
      settled.value = to * w;
      scheduleOnRN(settle, (to + count - 1) % count, Math.max(-1, Math.min(1, slot - from)));
    },
    [count, offset, settled, userScroll, pageWidth, ref, settle],
  );

  // On iOS (Fabric) every non-animated `scrollTo` also emits a momentum-end event, so the end
  // handlers only act after a real drag (`userScroll`), never on the driven slide's own frames.
  // On Android a new drag cancels the previous snap, which emits its momentum end after
  // `onBeginDrag`, so momentum ends are ignored while the finger is down (`fingerDown`).
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const w = pageWidth.value;
      if (w <= 0) return;
      const position = event.contentOffset.x / w;
      const nearest = Math.round(position);
      if (Math.abs(position - nearest) > 1 - INDEX_CHANGE_AT) return;
      const index = (nearest + count - 1) % count;
      if (index === shown.value) return;
      shown.value = index;
      if (onIndexChange) scheduleOnRN(onIndexChange, index);
    },
    onBeginDrag: (event) => {
      cancelAnimation(offset);
      userScroll.value = true;
      fingerDown.value = true;
      // A re-drag that caught the previous snap on a clone slot would hit the content's edge:
      // move one full round into the pages, same pixels, so there is always room either way.
      const w = pageWidth.value;
      const x = event.contentOffset.x;
      if (x < w) {
        scrollTo(ref, x + count * w, 0, false);
        settled.value += count * w;
      } else if (x > count * w) {
        scrollTo(ref, x - count * w, 0, false);
        settled.value -= count * w;
      }
      scheduleOnRN(setDragging, true);
    },
    onEndDrag: (event) => {
      fingerDown.value = false;
      // Released exactly on a page with no fling: nothing will decelerate, so land now.
      if (!userScroll.value) return;
      const w = pageWidth.value;
      const x = event.contentOffset.x;
      const slot = Math.round(x / w);
      const velocity = event.velocity?.x ?? 0;
      if (Math.abs(x - slot * w) < 0.5 && Math.abs(velocity) < 0.01) land(slot);
    },
    onMomentumEnd: (event) => {
      if (!userScroll.value || fingerDown.value) return;
      land(Math.round(event.contentOffset.x / pageWidth.value));
    },
  });

  // Position the pages for this width and page count; also the initial scroll to slot 1. A
  // shorter `data` re-snaps to the clamped page.
  useEffect(() => {
    if (width <= 0 || count === 0) return;
    const index = Math.min(activeRef.current, count - 1);
    const x = (wrap ? index + 1 : 0) * width;
    pageWidth.set(width);
    settled.set(x);
    offset.set(x);
    setMove((current) =>
      current.index > count - 1 ? { index: count - 1, step: 0, at: Date.now() } : current,
    );
  }, [width, wrap, count, pageWidth, offset, settled]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state !== 'background');
    });
    return () => subscription.remove();
  }, []);

  const playing =
    autoplay &&
    !reduceMotion &&
    !stopped &&
    !touching &&
    !dragging &&
    foreground &&
    wrap &&
    width > 0;

  // Whenever autoplay becomes possible again (touch released, drag settled, app active, reduce
  // motion off, autoplay prop back on), the full rest is counted from that moment.
  useEffect(() => {
    if (playing) setRestFrom(Date.now());
  }, [playing]);

  const landedAt = move.at;
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => {
        offset.set(
          withTiming((active + 2) * width, { duration, easing: SLIDE_EASING }, (finished) => {
            'worklet';
            if (finished) land(active + 2);
          }),
        );
      },
      Math.max(0, interval - (Date.now() - Math.max(landedAt, restFrom))),
    );
    return () => clearTimeout(timer);
  }, [playing, active, landedAt, restFrom, interval, duration, width, offset, land]);

  useEffect(() => () => cancelAnimation(offset), [offset]);

  const onLayout = (event: LayoutChangeEvent) => {
    if (widthProp === undefined) setMeasured(event.nativeEvent.layout.width);
  };

  const touchStart = () => {
    setTouching(true);
    if (stopAutoplayOnInteraction) setStopped(true);
  };
  const touchEnd = () => setTouching(false);

  const slots = wrap ? [count - 1, ...data.keys(), 0] : [...data.keys()];

  return (
    <View
      style={[styles.root, style]}
      onLayout={onLayout}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onTouchCancel={touchEnd}
      testID={testID}
    >
      {width > 0 && count > 0 && (
        <Animated.ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          disableIntervalMomentum
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={wrap}
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentOffset={{ x: wrap ? width : 0, y: 0 }}
          style={styles.scroll}
        >
          {slots.map((index, slot) => {
            const item = data[index] as T;
            const clone = wrap && (slot === 0 || slot === count + 1);
            const distance = (index - active + count) % count;
            return (
              <View
                key={clone ? `clone-${slot}` : (keyExtractor?.(item, index) ?? index)}
                style={[styles.page, { width }]}
              >
                {renderItem({
                  item,
                  index,
                  isActive: !clone && index === active,
                  isAdjacent: wrap && (distance === 1 || distance === count - 1),
                })}
              </View>
            );
          })}
        </Animated.ScrollView>
      )}
      {indicator && wrap && (
        <View pointerEvents="none" style={[styles.indicator, indicatorStyle]}>
          <Dots
            index={active}
            step={move.step}
            count={count}
            visible={Math.max(1, Math.round(visibleDots))}
            color={dotColor}
            inactiveColor={inactiveDotColor}
            animate={!reduceMotion}
          />
        </View>
      )}
    </View>
  );
}

interface DotsProps {
  index: number;
  step: number;
  count: number;
  visible: number;
  color: string;
  inactiveColor: string;
  animate: boolean;
}

/**
 * Overflow dots: the selected dot stays in the centre and the row scrolls under it. Every dot
 * looks the same apart from its distance to the selection, so on a page change the row is redrawn
 * around the new page shifted one pitch back (identical pixels), then slides home.
 */
function Dots({ index, step, count, visible, color, inactiveColor, animate }: DotsProps) {
  const shift = useSharedValue(0);
  const previous = useRef(index);
  const half = Math.floor(visible / 2);

  useEffect(() => {
    if (index === previous.current) return;
    previous.current = index;
    if (step === 0 || !animate) {
      shift.set(0);
      return;
    }
    shift.set(step);
    shift.set(withTiming(0, { duration: DOT_DURATION, easing: DOT_EASING }));
  }, [index, step, animate, shift]);

  useEffect(() => () => cancelAnimation(shift), [shift]);

  const slots: number[] = [];
  for (let slot = -half - 1; slot <= half + 1; slot++) slots.push(slot);

  return (
    <View
      accessible
      accessibilityLabel={`Page ${index + 1} of ${count}`}
      style={[styles.dots, { width: visible * DOT_PITCH }]}
    >
      {slots.map((slot) => (
        <Dot
          key={slot}
          slot={slot}
          half={half}
          shift={shift}
          color={slot === 0 ? color : inactiveColor}
        />
      ))}
    </View>
  );
}

interface DotProps {
  slot: number;
  half: number;
  shift: SharedValue<number>;
  color: string;
}

function Dot({ slot, half, shift, color }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = slot + shift.value;
    const size = interpolate(
      Math.abs(position),
      [half - 1, half, half + 1, half + 2],
      [DOT, DOT_SMALL, DOT_TINY, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: position * DOT_PITCH }, { scale: size / DOT }],
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  page: {
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 5,
    alignItems: 'center',
  },
  dots: {
    height: DOT,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
});
