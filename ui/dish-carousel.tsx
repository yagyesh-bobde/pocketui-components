import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Image,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  Pressable,
  type ScrollViewInstance,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { dishIndex, dishLanding, dishQuantity } from './dish-carousel-state';
import { useTheme } from './theme';

const REVEAL = require('./assets/dish-carousel/reveal.json');
const HEADING = require('./assets/dish-carousel/heading.json');
const BACKGROUND = require('./assets/dish-carousel/background.png');
const CLOCHE = require('./assets/dish-carousel/cloche.png');
const VEG = require('./assets/dish-carousel/veg.png');
const CLOCK = require('./assets/dish-carousel/clock.png');

export interface DishCarouselItem {
  readonly id: string;
  readonly name: string;
  readonly image: ImageSourcePropType;
  readonly price: string | number;
  readonly unit: string;
  readonly eta?: string;
  readonly mrp?: string | null;
  readonly maxQuantity?: number;
}

export interface DishCarouselProps {
  readonly data: readonly DishCarouselItem[];
  readonly quantities?: Readonly<Record<string, number>>;
  readonly onQuantityChange?: (id: string, quantity: number) => void;
  readonly onIndexChange?: (index: number) => void;
  readonly fontFamily?: string;
  readonly priceFontFamily?: string;
  readonly heading?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/** Centre-scaled cyclic product pager. Cloche opens once per item ID for this mount. */
export function DishCarousel({
  data,
  quantities,
  onQuantityChange,
  onIndexChange,
  fontFamily,
  priceFontFamily,
  heading = true,
  style,
  testID,
}: DishCarouselProps) {
  const { colors } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(true);
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) {
        setReducedMotion(value);
        setMotionReady(true);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [width, setWidth] = useState(0);
  const [slot, setSlot] = useState(data.length > 1 ? data.length : 0);
  const [localQuantities, setLocalQuantities] = useState<Readonly<Record<string, number>>>({});
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  const [revealing, setRevealing] = useState<string>();
  const scroll = useRef<ScrollViewInstance>(null);
  const headingRef = useRef<LottieView>(null);
  useEffect(() => {
    if (foreground && !reducedMotion) headingRef.current?.resume();
    else headingRef.current?.pause();
  }, [foreground, reducedMotion]);
  const offset = useSharedValue(0);
  const pageWidth = data.length > 1 ? width / 1.6 : width * 0.625;
  const cardHeight = pageWidth * (4 / 3);
  const count = data.length;
  const index = dishIndex(slot, count);
  const activeId = data[index]?.id;
  const pages = (count > 1 ? [0, 1, 2] : [0]).flatMap((round) =>
    data.map((item, index) => ({
      key: `${round}-${item.id}`,
      item,
      position: round * count + index,
    })),
  );
  const values = quantities ?? localQuantities;
  // Reset geometry when IDs/order change; preserve reveal and cart state by stable ID.
  const signature = JSON.stringify(data.map((item) => item.id));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!width || !signature) return;
    const first = count > 1 ? count : 0;
    setSlot(first);
    offset.set(first * pageWidth);
    scroll.current?.scrollTo({ x: first * pageWidth, animated: false });
  }, [count, pageWidth, offset, signature, width]);

  useEffect(() => {
    setRevealing((current) => (current === activeId ? current : undefined));
  }, [activeId]);
  useEffect(() => {
    if (reducedMotion) setRevealing(undefined);
  }, [reducedMotion]);

  useEffect(() => {
    if (!motionReady || !activeId || !foreground || !width || opened.has(activeId)) return;
    setOpened((previous) => new Set(previous).add(activeId));
    setRevealing(reducedMotion ? undefined : activeId);
  }, [activeId, foreground, motionReady, opened, reducedMotion, width]);

  const land = useCallback(
    (rawSlot: number) => {
      const next = dishLanding(rawSlot, count);
      if (rawSlot !== next) scroll.current?.scrollTo({ x: next * pageWidth, animated: false });
      offset.set(next * pageWidth);
      setSlot(next);
      onIndexChange?.(dishIndex(next, count));
    },
    [count, onIndexChange, offset, pageWidth],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      offset.set(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      if (pageWidth) scheduleOnRN(land, Math.round(event.contentOffset.x / pageWidth));
    },
    onEndDrag: (event) => {
      if (
        pageWidth &&
        Math.abs(
          event.contentOffset.x / pageWidth - Math.round(event.contentOffset.x / pageWidth),
        ) < 0.001
      ) {
        scheduleOnRN(land, Math.round(event.contentOffset.x / pageWidth));
      }
    },
  });

  function change(item: DishCarouselItem, delta: number) {
    const quantity = dishQuantity((values[item.id] ?? 0) + delta, item.maxQuantity);
    if (!quantities) setLocalQuantities((previous) => ({ ...previous, [item.id]: quantity }));
    onQuantityChange?.(item.id, quantity);
  }

  function measure(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  if (count === 0) return null;

  return (
    <View
      testID={testID}
      onLayout={measure}
      style={[{ backgroundColor: colors.background }, style]}
    >
      {heading && width > 0 && (
        <View accessible accessibilityRole="header" accessibilityLabel="Newly launched">
          <LottieView
            ref={headingRef}
            source={HEADING}
            autoPlay={!reducedMotion && foreground}
            loop={false}
            progress={reducedMotion ? 179 / 180 : undefined}
            style={{ width, height: width / 3.673 }}
          />
        </View>
      )}
      {width > 0 && (
        <Animated.ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scrollEnabled={count > 1}
          snapToInterval={pageWidth}
          disableIntervalMomentum
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentOffset={{ x: count > 1 ? count * pageWidth : 0, y: 0 }}
          contentContainerStyle={{ paddingHorizontal: (width - pageWidth) / 2 }}
          style={{ height: cardHeight + 30 }}
          accessibilityLabel="Newly launched dishes"
          accessibilityActions={[
            { name: 'increment', label: 'Next dish' },
            { name: 'decrement', label: 'Previous dish' },
          ]}
          onAccessibilityAction={({ nativeEvent }) => {
            const target = slot + (nativeEvent.actionName === 'increment' ? 1 : -1);
            scroll.current?.scrollTo({ x: target * pageWidth, animated: !reducedMotion });
            if (reducedMotion) land(target);
          }}
        >
          {pages.map(({ key, item, position }) => {
            const active = position === slot;
            return (
              <DishCard
                key={key}
                item={item}
                position={position}
                offset={offset}
                width={pageWidth}
                height={cardHeight}
                active={active}
                opened={opened.has(item.id)}
                revealing={active && revealing === item.id}
                onRevealEnd={() =>
                  setRevealing((current) => (current === item.id ? undefined : current))
                }
                reducedMotion={reducedMotion}
                foreground={foreground}
                quantity={dishQuantity(values[item.id] ?? 0, item.maxQuantity)}
                onChange={(delta) => change(item, delta)}
                fontFamily={fontFamily}
                priceFontFamily={priceFontFamily}
              />
            );
          })}
        </Animated.ScrollView>
      )}
    </View>
  );
}

interface CardProps {
  item: DishCarouselItem;
  position: number;
  offset: SharedValue<number>;
  width: number;
  height: number;
  active: boolean;
  opened: boolean;
  revealing: boolean;
  onRevealEnd: () => void;
  reducedMotion: boolean;
  foreground: boolean;
  quantity: number;
  onChange: (delta: number) => void;
  fontFamily?: string;
  priceFontFamily?: string;
}

function DishCard({
  item,
  position,
  offset,
  width,
  height,
  active,
  opened,
  revealing,
  onRevealEnd,
  reducedMotion,
  foreground,
  quantity,
  onChange,
  fontFamily,
  priceFontFamily,
}: CardProps) {
  const scale = width / 240;
  const revealRef = useRef<LottieView>(null);
  useEffect(() => {
    if (foreground && !reducedMotion) revealRef.current?.resume();
    else revealRef.current?.pause();
  }, [foreground, reducedMotion]);
  const transform = useAnimatedStyle(() => ({
    transform: [{ scale: Math.max(0.85, 1 - 0.15 * Math.abs(offset.get() / width - position)) }],
  }));
  const text = { fontFamily, color: '#ffffff' };

  return (
    <Animated.View
      style={[{ width, height: height + 25 }, transform]}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    >
      <View style={[styles.card, { height, borderRadius: 18 * scale }]}>
        <Image
          source={BACKGROUND}
          resizeMode="stretch"
          style={{ position: 'absolute', top: 0, left: 0, width, height: width / 0.322 }}
        />
        <Image
          source={item.image}
          resizeMode="cover"
          style={{ width, height: width / 1.2 }}
          accessibilityLabel={item.name}
        />
        <View
          style={[
            styles.price,
            { top: width / 1.2 - 17 * scale, paddingHorizontal: 14 * scale, height: 40 * scale },
          ]}
        >
          <Text style={[text, { color: '#00df80', fontSize: 20 * scale, fontWeight: '800' }]}>
            ₹
          </Text>
          <Text
            style={{
              fontFamily: priceFontFamily,
              color: '#00df80',
              fontSize: 30 * scale,
              fontWeight: priceFontFamily ? undefined : '900',
              lineHeight: 39 * scale,
            }}
          >
            {item.price}
          </Text>
          {item.mrp && (
            <Text
              style={[
                text,
                {
                  color: '#00c87a',
                  textDecorationLine: 'line-through',
                  fontSize: 10 * scale,
                  marginLeft: 5 * scale,
                },
              ]}
            >
              {item.mrp}
            </Text>
          )}
        </View>
        <Animated.View
          style={[styles.details, { top: width / 1.2 + 34 * scale, paddingHorizontal: 12 * scale }]}
        >
          <View style={styles.highlights}>
            <Image source={VEG} style={{ width: 11 * scale, height: 11 * scale }} />
            <Text style={[text, { fontSize: 11 * scale }]}>{item.unit}</Text>
            <Image
              source={CLOCK}
              style={{ width: 12 * scale, height: 12 * scale, marginLeft: 8 * scale }}
            />
            <Text style={[text, { fontSize: 11 * scale }]}>{item.eta ?? '10 mins'}</Text>
          </View>
          <Text
            numberOfLines={2}
            style={[
              text,
              {
                fontSize: 13 * scale,
                lineHeight: 17 * scale,
                textAlign: 'center',
                marginTop: 6 * scale,
              },
            ]}
          >
            {item.name}
          </Text>
        </Animated.View>
        {!opened && (
          <Image
            source={CLOCHE}
            resizeMode="cover"
            style={{ position: 'absolute', top: 0, left: 0, width, height }}
          />
        )}
        {revealing && !reducedMotion && (
          <LottieView
            ref={revealRef}
            source={REVEAL}
            autoPlay
            loop={false}
            resizeMode="cover"
            onAnimationFinish={onRevealEnd}
            onAnimationFailure={onRevealEnd}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <Animated.View
        style={[styles.cta, { top: height - 21 * scale, width: width * 0.72, left: width * 0.14 }]}
      >
        <DishAddButton
          name={item.name}
          quantity={quantity}
          maxQuantity={item.maxQuantity}
          onChange={onChange}
          scale={scale}
          active={active && foreground}
          reducedMotion={reducedMotion}
          fontFamily={fontFamily}
        />
      </Animated.View>
    </Animated.View>
  );
}

interface AddButtonProps {
  name: string;
  quantity: number;
  maxQuantity?: number;
  onChange: (delta: number) => void;
  scale: number;
  active: boolean;
  reducedMotion: boolean;
  fontFamily?: string;
}

/** Separate face, extrusion and ground shadow: a 50 ms physical press, then a 2 s idle float. */
function DishAddButton({
  name,
  quantity,
  maxQuantity = 30,
  onChange,
  scale,
  active,
  reducedMotion,
  fontFamily,
}: AddButtonProps) {
  const faceY = useSharedValue(0);
  const [touchVersion, setTouchVersion] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: faceY.get() * scale }] }));

  useEffect(() => {
    cancelAnimation(faceY);
    faceY.set(withTiming(0, { duration: reducedMotion ? 0 : 50 }));
    if (active && !reducedMotion) {
      timer.current = setTimeout(
        () => {
          faceY.set(
            withRepeat(
              withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
              -1,
              true,
            ),
          );
        },
        touchVersion ? 5000 : 0,
      );
    }
    return () => {
      clearTimeout(timer.current);
      cancelAnimation(faceY);
    };
  }, [active, faceY, reducedMotion, touchVersion]);

  function press(down: boolean) {
    clearTimeout(timer.current);
    cancelAnimation(faceY);
    faceY.set(withTiming(down ? 6 : 0, { duration: reducedMotion ? 0 : 50 }));
    if (!down) setTouchVersion((version) => version + 1);
  }

  return (
    <View style={{ width: 172.8 * scale, height: 49 * scale }}>
      <Svg
        pointerEvents="none"
        width="100%"
        height={49 * scale}
        viewBox="0 0 173 49"
        style={StyleSheet.absoluteFill}
      >
        <Path d="M18 39H155L153 45Q152 48 148 48H25Q20 48 19 45Z" fill="#e4e7eb" />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, faceStyle]}>
        <Svg
          pointerEvents="none"
          width="100%"
          height={49 * scale}
          viewBox="0 0 173 49"
          style={StyleSheet.absoluteFill}
        >
          <Path d="M1 28H172L168 37Q167 40 163 40H10Q6 40 5 37Z" fill="#003e2b" />
          <Path
            d="M13 1H160Q163 1 164 4L172 27Q174 31 168 31H5Q-1 31 1 27L10 4Q11 1 13 1Z"
            fill={quantity ? '#00a85b' : '#f8fffc'}
            stroke="#003e2b"
            strokeWidth="0.8"
          />
        </Svg>
        <View style={[styles.buttonContent, { width: 172.8 * scale, height: 32 * scale }]}>
          {quantity > 0 ? (
            <>
              <Pressable
                accessibilityRole="button"
                key="decrement"
                accessibilityLabel={`Remove one ${name}`}
                disabled={!active}
                onPressIn={() => press(true)}
                onPressOut={() => press(false)}
                onPress={() => onChange(-1)}
                hitSlop={6}
                style={styles.step}
              >
                <Text style={[styles.stepText, { color: '#ffffff', fontSize: 20 * scale }]}>−</Text>
              </Pressable>
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  fontFamily,
                  color: '#ffffff',
                  fontSize: 13 * scale,
                  width: '34%',
                  textAlign: 'center',
                }}
              >
                {quantity}
              </Text>
              <Pressable
                accessibilityRole="button"
                key="increment"
                accessibilityLabel={`Add one ${name}`}
                accessibilityState={{ disabled: quantity >= maxQuantity }}
                disabled={!active || quantity >= maxQuantity}
                onPressIn={() => press(true)}
                onPressOut={() => press(false)}
                onPress={() => onChange(1)}
                hitSlop={6}
                style={styles.step}
              >
                <Text
                  style={[
                    styles.stepText,
                    {
                      color: '#ffffff',
                      fontSize: 20 * scale,
                      opacity: quantity >= maxQuantity ? 0.4 : 1,
                    },
                  ]}
                >
                  +
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              key="add"
              accessibilityLabel={`Add ${name}`}
              disabled={!active || maxQuantity <= 0}
              onPressIn={() => press(true)}
              onPressOut={() => press(false)}
              onPress={() => onChange(1)}
              style={styles.add}
            >
              <Text
                style={{ fontFamily, fontWeight: '800', fontSize: 13 * scale, color: '#003e2b' }}
              >
                ADD
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', backgroundColor: '#00543c' },
  price: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 64,
    backgroundColor: '#003d2a',
    borderWidth: 0.5,
    borderColor: '#087746',
  },
  details: { position: 'absolute', width: '100%', alignItems: 'center' },
  highlights: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cta: { position: 'absolute' },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  add: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  step: { width: '33%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontWeight: '400' },
});
