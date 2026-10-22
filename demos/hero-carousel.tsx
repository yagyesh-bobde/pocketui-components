import { useEffect, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroCarousel, type HeroCarouselItemInfo } from '../ui/hero-carousel';
import { SearchBar } from '../ui/search-bar';
import { theme, useTheme } from '../ui/theme';

/**
 * A food-delivery home hero: four full-bleed banners built from layered art, with a transparent
 * header (location line + search bar) over them that tints per page. Pages 2 and 3 animate while
 * they are on screen: crossfading scenes with drifting food, and a headline that splits apart
 * over a dish slot that swaps every 0.9 s.
 *
 * Edge-to-edge: the hero starts at the top of the screen and grows by the status-bar inset, so
 * the art runs up behind the system bar and the status-bar icons follow the header tint.
 */

/** The art is drawn for a 1080x961 frame (384x342 dp) whose top 122 px sit under the status bar. */
const FRAME_W = 1080;
const FRAME_H = 961;
const STATUS_PX = 122;
/** Frame px per dp. */
const PX = 2.8125;
/** The hero below the status bar: the frame minus its status-bar band. The inset is added on top. */
const HERO_ASPECT = FRAME_W / (FRAME_H - STATUS_PX);
/** Autoplay slide, so a page keeps its state until it has left the screen. */
const SLIDE = 450;

/** Page 2 timeline (ms): each scene fades in over FADE then holds; three scenes per CYCLE. */
const SCENE = 1400;
const FADE = 400;
const FLY_IN = 1000;
const FLY_OUT = 500;
const CYCLE = SCENE * 3;
const DRIFT_PERIOD = 2800;
/** Objects start this far outside the frame. */
const OUTSIDE = 160 / PX;

/** Page 3 timeline (ms). */
const INTRO = 450;
const SPLIT = 600;
const DISH_EVERY = 900;
const POP = 150;
const WIGGLE_PERIOD = 900;

/** A clock that stops counting after this long (~2.7 h); the page will have moved on. */
const CLOCK_MAX = 1e7;

/** Header tint per page: white over the dark banners, navy over the light ones. */
const TITLE_TINTS = ['#293142', '#ffffff', '#ffffff', '#293142'] as const;
/** Avatar fill under a navy / white letter. */
const AVATAR_ON_LIGHT = 'rgba(255, 255, 255, 0.6)';
const AVATAR_ON_DARK = 'rgba(255, 255, 255, 0.2)';
const PLACEHOLDERS = [
  'Search "biryani"',
  'Search "pizza"',
  'Search "cake"',
  'Search "dosa"',
  'Search "momos"',
];

type EnterFrom = 'left' | 'right' | 'bottom';

interface ObjectLayer {
  source: ImageSourcePropType;
  aspect: number;
  /** % of the frame. */
  left: number;
  top: number;
  width: number;
  /** Drift amplitude in frame px, and a phase in turns. */
  ax: number;
  ay: number;
  phase: number;
  enterFrom: EnterFrom;
}

interface Scene {
  background: ImageSourcePropType;
  label: string;
  labelColor: string;
  objects: readonly ObjectLayer[];
}

const SCENES: readonly Scene[] = [
  {
    background: require('./assets/hero-carousel/b2-scene1-bg.webp'),
    label: 'HOMESTYLE',
    labelColor: '#f48fb1',
    objects: [
      {
        source: require('./assets/hero-carousel/b2-scene1-obj-curry.webp'),
        aspect: 420 / 351,
        left: 71,
        top: 48,
        width: 22.5,
        ax: 11,
        ay: 13,
        phase: 0,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene1-obj-rice.webp'),
        aspect: 420 / 343,
        left: 80,
        top: 69,
        width: 15.5,
        ax: 8,
        ay: 9,
        phase: 0.4,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene1-obj-flatbread.webp'),
        aspect: 420 / 377,
        left: 4,
        top: 75,
        width: 20.5,
        ax: 9,
        ay: 7,
        phase: 0.25,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene1-obj-lime.webp'),
        aspect: 240 / 229,
        left: 11,
        top: 53,
        width: 11,
        ax: 12,
        ay: 11,
        phase: 0.6,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene1-obj-chilli.webp'),
        aspect: 240 / 279,
        left: 72.5,
        top: 79,
        width: 7.5,
        ax: 6,
        ay: 19,
        phase: 0.8,
        enterFrom: 'bottom',
      },
    ],
  },
  {
    background: require('./assets/hero-carousel/b2-scene2-bg.webp'),
    label: 'COFFEE',
    labelColor: '#f5a25d',
    objects: [
      {
        source: require('./assets/hero-carousel/b2-scene2-obj-latte.webp'),
        aspect: 420 / 365,
        left: 70.5,
        top: 50.5,
        width: 24.5,
        ax: 24,
        ay: 14,
        phase: 0,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene2-obj-cookie.webp'),
        aspect: 320 / 297,
        left: 83,
        top: 74.5,
        width: 12,
        ax: 10,
        ay: 6,
        phase: 0.45,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene2-obj-takeaway-cup.webp'),
        aspect: 320 / 481,
        left: 7,
        top: 71.5,
        width: 14,
        ax: 19,
        ay: 12,
        phase: 0.25,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene2-obj-beans.webp'),
        aspect: 260 / 340,
        left: 9.5,
        top: 50,
        width: 15.5,
        ax: 24,
        ay: 11,
        phase: 0.6,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene2-obj-croissant.webp'),
        aspect: 420 / 267,
        left: 60,
        top: 80.5,
        width: 17,
        ax: 12,
        ay: 8,
        phase: 0.8,
        enterFrom: 'bottom',
      },
    ],
  },
  {
    background: require('./assets/hero-carousel/b2-scene3-bg.webp'),
    label: 'BREAKFAST',
    labelColor: '#ffd54f',
    objects: [
      {
        source: require('./assets/hero-carousel/b2-scene3-obj-yoghurt.webp'),
        aspect: 360 / 330,
        left: 71,
        top: 50.5,
        width: 20,
        ax: 13,
        ay: 5,
        phase: 0,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene3-obj-cherries.webp'),
        aspect: 300 / 307,
        left: 86.5,
        top: 68.5,
        width: 9,
        ax: 27,
        ay: 2,
        phase: 0.4,
        enterFrom: 'right',
      },
      {
        source: require('./assets/hero-carousel/b2-scene3-obj-toast.webp'),
        aspect: 420 / 379,
        left: 4.5,
        top: 75,
        width: 20.5,
        ax: 11,
        ay: 6,
        phase: 0.25,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene3-obj-kiwi.webp'),
        aspect: 260 / 289,
        left: 11,
        top: 53,
        width: 13,
        ax: 13,
        ay: 6,
        phase: 0.6,
        enterFrom: 'left',
      },
      {
        source: require('./assets/hero-carousel/b2-scene3-obj-watermelon.webp'),
        aspect: 360 / 314,
        left: 66.5,
        top: 82,
        width: 13.5,
        ax: 30,
        ay: 18,
        phase: 0.8,
        enterFrom: 'bottom',
      },
    ],
  },
];

const DISHES = [
  { source: require('./assets/hero-carousel/b3-dish-1.webp'), aspect: 420 / 349 },
  { source: require('./assets/hero-carousel/b3-dish-2.webp'), aspect: 420 / 348 },
  { source: require('./assets/hero-carousel/b3-dish-3.webp'), aspect: 420 / 347 },
  { source: require('./assets/hero-carousel/b3-dish-4.webp'), aspect: 420 / 364 },
] as const;

/**
 * Price tags on page 3: % position and wiggle phase in turns. The first sits under the status
 * bar's content, right of the location text, so it stays clear of the clock and the header.
 */
const TAGS = [
  { left: 53, top: 11, phase: 0 },
  { left: 64.5, top: 22.5, phase: 0.33 },
  { left: 75.5, top: 85.5, phase: 0.66 },
] as const;

const PAGES = ['delivery', 'subscriptions', 'offer', 'rewards'] as const;
type Page = (typeof PAGES)[number];

export default function HeroCarouselDemo() {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const tint = TITLE_TINTS[page] ?? TITLE_TINTS[0];
  const light = isLight(tint);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle={light ? 'light-content' : 'dark-content'} />
      <View style={styles.hero}>
        <View style={[styles.heroSize, { marginTop: top }]} />
        <HeroCarousel
          data={PAGES}
          keyExtractor={(item) => item}
          renderItem={renderBanner}
          onIndexChange={setPage}
          style={styles.carousel}
          testID="hero-carousel"
        />
        <View pointerEvents="box-none" style={[styles.header, { paddingTop: top }]}>
          <View style={styles.locationRow}>
            <Pin color={tint} />
            <View style={styles.location}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: tint }]} testID="hero-carousel-title">
                  Koramangala
                </Text>
                <Chevron color={tint} />
              </View>
              <Text numberOfLines={1} style={[styles.subtitle, { color: tint }]}>
                Bengaluru, Karnataka, India
              </Text>
            </View>
            <View
              style={[
                styles.avatar,
                { borderColor: tint, backgroundColor: light ? AVATAR_ON_DARK : AVATAR_ON_LIGHT },
              ]}
            >
              <Text style={[styles.avatarText, { color: tint }]}>P</Text>
            </View>
          </View>
          <SearchBar
            placeholders={PLACEHOLDERS}
            placeholderTextColor="#767c8f"
            leading={<Magnifier color="#ef4f5f" />}
            trailing={
              <View style={styles.trailing}>
                <View style={styles.divider} />
                <Mic color="#ef4f5f" />
              </View>
            }
            style={styles.search}
            testID="hero-carousel-search"
          />
        </View>
      </View>

      <View style={styles.feed}>
        <Text style={[styles.feedHeading, { color: colors.mutedForeground }]}>
          RECOMMENDED FOR YOU
        </Text>
        <View style={styles.feedRow}>
          {['55% OFF select items', 'Items from ₹239', '₹100 OFF above ₹149'].map((label) => (
            <View key={label} style={[styles.feedCard, { backgroundColor: colors.muted }]}>
              <Text numberOfLines={2} style={[styles.feedLabel, { color: colors.foreground }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function renderBanner({ item, isActive, isAdjacent }: HeroCarouselItemInfo<Page>) {
  switch (item) {
    case 'delivery':
      return <DeliveryBanner />;
    case 'subscriptions':
      return <SubscriptionsBanner isActive={isActive} isAdjacent={isAdjacent} />;
    case 'offer':
      return <OfferBanner isActive={isActive} isAdjacent={isAdjacent} />;
    case 'rewards':
      return <RewardsBanner />;
  }
}

/** Rough luma test for a `#rrggbb` tint, to pick status-bar icons that match it. */
function isLight(hex: string): boolean {
  const channel = (at: number) => Number.parseInt(hex.slice(at, at + 2), 16);
  return 0.299 * channel(1) + 0.587 * channel(3) + 0.114 * channel(5) > 150;
}

interface BannerState {
  isActive: boolean;
  isAdjacent: boolean;
}

/** Ms since `running` turned on, counted on the UI thread; 0 while off. */
function useClock(running: boolean): SharedValue<number> {
  const clock = useSharedValue(0);
  useEffect(() => {
    if (!running) return;
    clock.set(0);
    clock.set(withTiming(CLOCK_MAX, { duration: CLOCK_MAX, easing: Easing.linear }));
    return () => {
      cancelAnimation(clock);
      clock.set(0);
    };
  }, [running, clock]);
  return clock;
}

/** `flag`, held on for `ms` after it turns off, so a page keeps its state while sliding out. */
function useLinger(flag: boolean, ms: number): boolean {
  const [held, setHeld] = useState(flag);
  useEffect(() => {
    if (flag) {
      setHeld(true);
      return;
    }
    const timer = setTimeout(() => setHeld(false), ms);
    return () => clearTimeout(timer);
  }, [flag, ms]);
  return flag || held;
}

/**
 * Clocks for one banner: `loop` runs whenever the page can be seen (active or one swipe away),
 * `sequence` starts at landing and keeps going until the page has slid away.
 */
function useBannerClocks({ isActive, isAdjacent }: BannerState) {
  const reduceMotion = useReducedMotion();
  const shown = useLinger(isActive || isAdjacent, SLIDE + 100);
  const landed = useLinger(isActive, SLIDE + 100);
  return {
    loop: useClock(!reduceMotion && shown),
    sequence: useClock(!reduceMotion && landed),
  };
}

/**
 * The 1080x961 art frame, bottom-aligned in the banner so it keeps its place under the header.
 * A status bar taller than the art's 122 px band would leave a strip above it, so the backdrop is
 * drawn again there, mirrored at the frame's top edge. Reports its width for px -> dp maths.
 */
function Frame({
  backdrop,
  frameWidth,
  children,
}: {
  backdrop: React.ReactNode;
  frameWidth?: SharedValue<number>;
  children?: React.ReactNode;
}) {
  const onLayout = (event: LayoutChangeEvent) => frameWidth?.set(event.nativeEvent.layout.width);
  return (
    <View style={styles.banner}>
      <View style={styles.frame} onLayout={onLayout}>
        <View style={styles.bleed}>{backdrop}</View>
        {backdrop}
        {children}
      </View>
    </View>
  );
}

function Backdrop({ source }: { source: ImageSourcePropType }) {
  return <Image accessibilityIgnoresInvertColors source={source} style={styles.fill} />;
}

function DeliveryBanner() {
  return (
    <Frame backdrop={<Backdrop source={require('./assets/hero-carousel/b1-bg.webp')} />}>
      <View style={styles.deliveryCopy}>
        <Text style={styles.deliveryHeadline}>FREE DELIVERY</Text>
        <Text style={styles.deliverySub}>on orders above ₹99</Text>
      </View>
      <View style={styles.deliveryPill}>
        <Text style={styles.deliveryPillText}>Plus · 3 months at ₹1 ›</Text>
      </View>
    </Frame>
  );
}

function easeOut(p: number): number {
  'worklet';
  return 1 - (1 - p) * (1 - p);
}

function easeIn(p: number): number {
  'worklet';
  return p * p;
}

function clamp01(p: number): number {
  'worklet';
  return Math.min(1, Math.max(0, p));
}

/**
 * Ms into scene `scene`'s slot on page 2, with the first FADE ms of each slot being its
 * crossfade in. Scene 0 is on screen the moment the page lands, so its first slot starts
 * FADE ms "early", already faded in.
 */
function sceneTime(t: number, scene: number): { tau: number; first: boolean } {
  'worklet';
  const u = t + FADE;
  const tau = (((u - scene * SCENE) % CYCLE) + CYCLE) % CYCLE;
  return { tau, first: u < CYCLE && (scene === 0 || u < scene * SCENE) };
}

function SubscriptionsBanner(state: BannerState) {
  const { loop, sequence } = useBannerClocks(state);
  const frameWidth = useSharedValue(0);
  return (
    <Frame
      frameWidth={frameWidth}
      backdrop={SCENES.map((scene, index) => (
        <SceneBackground
          key={scene.label}
          source={scene.background}
          scene={index}
          clock={sequence}
        />
      ))}
    >
      {SCENES.flatMap((scene, index) =>
        scene.objects.map((layer) => (
          <FloatingObject
            key={`${scene.label}-${layer.left}-${layer.top}`}
            layer={layer}
            scene={index}
            clock={sequence}
            drift={loop}
            frameWidth={frameWidth}
          />
        )),
      )}
      <View pointerEvents="none" style={styles.subscriptionsCopy}>
        <Text style={styles.eyebrow}>INTRODUCING</Text>
        <View style={styles.labelSlot}>
          {SCENES.map((scene, index) => (
            <SceneLabel key={scene.label} scene={index} clock={sequence}>
              <View style={[styles.label, { backgroundColor: scene.labelColor }]}>
                <Text style={styles.labelText}>{scene.label}</Text>
              </View>
            </SceneLabel>
          ))}
        </View>
        <Text style={styles.wordmark}>subscriptions</Text>
      </View>
      <View style={[styles.pill, styles.subscriptionsPill]}>
        <Text style={styles.pillText}>Explore now ›</Text>
      </View>
    </Frame>
  );
}

function SceneBackground({
  source,
  scene,
  clock,
}: {
  source: ImageSourcePropType;
  scene: number;
  clock: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const { tau } = sceneTime(clock.value, scene);
    let opacity = 0;
    if (tau < FADE) opacity = tau / FADE;
    else if (tau < SCENE) opacity = 1;
    else if (tau < SCENE + FADE) opacity = 1 - (tau - SCENE) / FADE;
    return { opacity };
  });
  return (
    <Animated.Image
      accessibilityIgnoresInvertColors
      source={source}
      style={[styles.fill, animatedStyle]}
    />
  );
}

/** Shows its label from the midpoint of the scene's fade in to the midpoint of its fade out. */
function SceneLabel({
  scene,
  clock,
  children,
}: {
  scene: number;
  clock: SharedValue<number>;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const { tau } = sceneTime(clock.value, scene);
    return { opacity: tau >= FADE / 2 && tau < SCENE + FADE / 2 ? 1 : 0 };
  });
  return <Animated.View style={[styles.labelLayer, animatedStyle]}>{children}</Animated.View>;
}

function FloatingObject({
  layer,
  scene,
  clock,
  drift,
  frameWidth,
}: {
  layer: ObjectLayer;
  scene: number;
  clock: SharedValue<number>;
  drift: SharedValue<number>;
  frameWidth: SharedValue<number>;
}) {
  const { left, top, width, ax, ay, phase, enterFrom } = layer;
  const animatedStyle = useAnimatedStyle(() => {
    const { tau, first } = sceneTime(clock.value, scene);
    // 1 = in place, 0 = parked outside the frame.
    let placed = 1;
    let shown = true;
    if (first && scene !== 0) shown = false;
    else if (tau < FLY_IN) placed = first ? 1 : easeOut(tau / FLY_IN);
    else if (tau >= SCENE + FLY_OUT) shown = false;
    else if (tau >= SCENE) placed = 1 - easeIn((tau - SCENE) / FLY_OUT);
    const w = frameWidth.value;
    const h = (w * FRAME_H) / FRAME_W;
    let outX = 0;
    let outY = 0;
    if (enterFrom === 'right') outX = ((100 - left) * w) / 100 + OUTSIDE;
    else if (enterFrom === 'left') outX = -(((left + width) * w) / 100 + OUTSIDE);
    else outY = ((100 - top) * h) / 100 + OUTSIDE;
    const angle = 2 * Math.PI * (drift.value / DRIFT_PERIOD + phase);
    return {
      opacity: shown ? 1 : 0,
      transform: [
        { translateX: outX * (1 - placed) + (ax / PX) * Math.sin(angle) },
        { translateY: outY * (1 - placed) + (ay / PX) * Math.sin(angle + Math.PI / 2) },
      ],
    };
  });
  return (
    <Animated.Image
      accessibilityIgnoresInvertColors
      source={layer.source}
      style={[
        styles.object,
        { left: `${left}%`, top: `${top}%`, width: `${width}%`, aspectRatio: layer.aspect },
        animatedStyle,
      ]}
    />
  );
}

/** Where the stacked headline lines sit (centre, % of the frame) and where they split to. */
const OFFER_LINES = [
  { from: { x: 50, y: 51.5 }, to: { x: 18, y: 49.6 }, scale: 0.47, color: '#ffd54f' },
  { from: { x: 50, y: 62.5 }, to: { x: 67, y: 69.6 }, scale: 0.56, color: '#ffffff' },
] as const;

function OfferBanner(state: BannerState) {
  const { loop, sequence } = useBannerClocks(state);
  const frameWidth = useSharedValue(0);
  return (
    <Frame frameWidth={frameWidth} backdrop={<PulsingBackground clock={loop} />}>
      {DISHES.map((dish, index) => (
        <Dish
          key={dish.aspect}
          index={index}
          aspect={dish.aspect}
          source={dish.source}
          clock={sequence}
        />
      ))}
      {OFFER_LINES.map((line, index) => (
        <HeadlineLine key={line.color} line={line} clock={sequence} frameWidth={frameWidth}>
          {index === 0 ? 'DISHES AT' : '50% OFF'}
        </HeadlineLine>
      ))}
      <Text style={styles.offerSub}>with free delivery</Text>
      <View style={[styles.pill, styles.offerPill]}>
        <Text style={styles.pillText}>Order now ›</Text>
      </View>
      {TAGS.map((tag) => (
        <PriceTag key={tag.phase} left={tag.left} top={tag.top} phase={tag.phase} clock={loop} />
      ))}
    </Frame>
  );
}

/** The sunburst, breathing 1.5% in time with the price tags. */
function PulsingBackground({ clock }: { clock: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const pulse = 0.5 - 0.5 * Math.cos((2 * Math.PI * clock.value) / WIGGLE_PERIOD);
    return { transform: [{ scale: 1 + 0.015 * pulse }] };
  });
  return (
    <Animated.Image
      accessibilityIgnoresInvertColors
      source={require('./assets/hero-carousel/b3-bg.webp')}
      style={[styles.fill, animatedStyle]}
    />
  );
}

function HeadlineLine({
  line,
  clock,
  frameWidth,
  children,
}: {
  line: (typeof OFFER_LINES)[number];
  clock: SharedValue<number>;
  frameWidth: SharedValue<number>;
  children: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = easeOut(clamp01((clock.value - INTRO) / SPLIT));
    const w = frameWidth.value;
    const h = (w * FRAME_H) / FRAME_W;
    return {
      transform: [
        { translateX: (((line.to.x - line.from.x) * w) / 100) * p },
        { translateY: (((line.to.y - line.from.y) * h) / 100) * p },
        { scale: 1 + (line.scale - 1) * p },
      ],
    };
  });
  return (
    <Animated.Text
      style={[
        styles.offerHeadline,
        { top: `${line.from.y - 5.5}%`, color: line.color },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.Text>
  );
}

/** Dish `index` pops in when its turn comes and scales away as the next one pops in. */
function Dish({
  index,
  aspect,
  source,
  clock,
}: {
  index: number;
  aspect: number;
  source: ImageSourcePropType;
  clock: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const tau = clock.value - INTRO - SPLIT;
    let p = 0;
    if (tau >= 0) {
      const turn = Math.floor(tau / DISH_EVERY);
      const local = tau - turn * DISH_EVERY;
      if (turn % DISHES.length === index) p = easeOut(clamp01(local / POP));
      else if ((turn - 1 + DISHES.length) % DISHES.length === index && turn > 0 && local < POP) {
        p = 1 - local / POP;
      }
    }
    return { opacity: p, transform: [{ scale: 0.6 + 0.4 * p }] };
  });
  return (
    <Animated.Image
      accessibilityIgnoresInvertColors
      source={source}
      style={[styles.dish, { aspectRatio: aspect }, animatedStyle]}
    />
  );
}

function PriceTag({
  left,
  top,
  phase,
  clock,
}: {
  left: number;
  top: number;
  phase: number;
  clock: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const angle = 2 * Math.PI * (clock.value / WIGGLE_PERIOD + phase);
    return {
      transform: [
        { translateX: (4 / PX) * Math.sin(angle) },
        { translateY: (13 / PX) * Math.sin(angle + Math.PI / 2) },
        { rotate: `${6 * Math.sin(angle + Math.PI / 4)}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.tag, { left: `${left}%`, top: `${top}%` }, animatedStyle]}>
      <Text style={styles.tagText}>₹</Text>
    </Animated.View>
  );
}

function RewardsBanner() {
  return (
    <Frame backdrop={<Backdrop source={require('./assets/hero-carousel/b4-bg.webp')} />}>
      <View style={styles.rewardsCopy}>
        <Text style={styles.rewardsHeadline}>ENJOY WELCOME REWARDS</Text>
        <Text style={styles.rewardsSub}>on your first 3 orders</Text>
      </View>
      <View style={styles.rewardsCaptions}>
        {['₹100 off', 'Locked', 'Locked'].map((caption, index) => (
          <Text key={`${caption}-${index.toString()}`} style={styles.rewardsCaption}>
            {caption}
          </Text>
        ))}
      </View>
    </Frame>
  );
}

/** Map pin drawn with Views: a ring on a point. */
function Pin({ color }: { color: string }) {
  return (
    <View style={styles.pin}>
      <View style={[styles.pinRing, { borderColor: color }]} />
      <View style={[styles.pinPoint, { borderTopColor: color }]} />
    </View>
  );
}

function Chevron({ color }: { color: string }) {
  return <View style={[styles.chevron, { borderColor: color }]} />;
}

/** Magnifier drawn with Views: a ring and a 45° handle. */
function Magnifier({ color }: { color: string }) {
  return (
    <View style={styles.icon}>
      <View style={[styles.iconRing, { borderColor: color }]} />
      <View style={[styles.iconHandle, { backgroundColor: color }]} />
    </View>
  );
}

/** Microphone drawn with Views: a capsule, a cradle and a stem. */
function Mic({ color }: { color: string }) {
  return (
    <View style={styles.mic}>
      <View style={[styles.micHead, { backgroundColor: color }]} />
      <View style={[styles.micCradle, { borderColor: color }]} />
      <View style={[styles.micStem, { backgroundColor: color }]} />
    </View>
  );
}

const TEXT_SHADOW = {
  textShadowColor: 'rgba(0, 0, 0, 0.35)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
} as const;

const styles = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xl,
  },
  hero: {
    width: '100%',
  },
  heroSize: {
    width: '100%',
    aspectRatio: HERO_ASPECT,
  },
  carousel: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: theme.spacing.md,
  },
  locationRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  location: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  search: {
    marginTop: theme.spacing.lg - 2,
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#e6e9ef',
  },
  feed: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  feedHeading: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
  feedRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  feedCard: {
    flex: 1,
    height: 140,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  feedLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },

  banner: {
    flex: 1,
    overflow: 'hidden',
  },
  frame: {
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    aspectRatio: FRAME_W / FRAME_H,
  },
  bleed: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    bottom: '100%',
    transform: [{ scaleY: -1 }],
  },
  fill: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  object: {
    position: 'absolute',
  },
  pill: {
    position: 'absolute',
    height: 26,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1c28',
  },

  // The band between the search bar and the scooter: one headline block left, the pill right.
  deliveryCopy: {
    position: 'absolute',
    left: '6%',
    top: '43%',
    width: '50%',
  },
  deliveryHeadline: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '900',
    color: '#293142',
    letterSpacing: -0.5,
  },
  deliverySub: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    color: '#293142',
    opacity: 0.8,
  },
  deliveryPill: {
    position: 'absolute',
    right: '6%',
    top: '44%',
    height: 26,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 13,
    justifyContent: 'center',
    backgroundColor: '#1c1c28',
  },
  deliveryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  subscriptionsCopy: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#ffffff',
    ...TEXT_SHADOW,
  },
  labelSlot: {
    height: 28,
    marginTop: theme.spacing.xs,
    alignSelf: 'stretch',
  },
  labelLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: theme.spacing.md,
    height: 28,
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    transform: [{ rotate: '-2deg' }],
  },
  labelText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1c1c28',
    letterSpacing: 0.5,
  },
  wordmark: {
    marginTop: -4,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#ffffff',
    ...TEXT_SHADOW,
  },
  subscriptionsPill: {
    left: '38%',
    top: '81%',
  },

  offerHeadline: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '11%',
    textAlign: 'center',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    ...TEXT_SHADOW,
  },
  dish: {
    position: 'absolute',
    left: '41%',
    top: '44%',
    width: '30%',
  },
  offerSub: {
    position: 'absolute',
    left: 0,
    width: '100%',
    top: '73.5%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    ...TEXT_SHADOW,
  },
  offerPill: {
    left: '38%',
    top: '81%',
  },
  tag: {
    position: 'absolute',
    width: 43,
    height: 26,
    borderRadius: theme.radius.sm,
    backgroundColor: '#ffd54f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1c1c28',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1c28',
  },

  rewardsCopy: {
    position: 'absolute',
    left: '10%',
    width: '80%',
    top: '30%',
    alignItems: 'center',
  },
  rewardsHeadline: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b3261e',
    letterSpacing: 0.5,
  },
  rewardsSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293142',
  },
  rewardsCaptions: {
    position: 'absolute',
    left: '5%',
    width: '90%',
    top: '48%',
    flexDirection: 'row',
  },
  rewardsCaption: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#293142',
  },

  pin: {
    width: 14,
    height: 20,
    alignItems: 'center',
  },
  pinRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    marginTop: -4,
    transform: [{ rotate: '45deg' }],
  },
  icon: {
    width: 20,
    height: 20,
  },
  iconRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
  },
  iconHandle: {
    position: 'absolute',
    top: 11.5,
    left: 14,
    width: 2,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  mic: {
    width: 14,
    height: 20,
    alignItems: 'center',
  },
  micHead: {
    width: 8,
    height: 12,
    borderRadius: 4,
  },
  micCradle: {
    position: 'absolute',
    top: 6,
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  micStem: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 4,
  },
});
