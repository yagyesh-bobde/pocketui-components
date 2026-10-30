import { useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CubeCarousel } from '../ui/cube-carousel';
import { useInteractionMotion } from '../ui/interaction-motion';
import { theme, useTheme } from '../ui/theme';

const stories = [
  {
    id: 'perspective',
    title: 'A different\nperspective.',
    label: 'A LITTLE CURIOSITY',
    mark: '◌',
    by: 'Alex Rivera',
    detail: 'Some ideas only need a little room to move.',
    color: '#244bc0',
  },
  {
    id: 'possibility',
    title: 'Another way\nto see it.',
    label: 'ROOM FOR POSSIBILITY',
    mark: '✳',
    by: 'Jamie Chen',
    detail: 'A small shift can change the whole picture.',
    color: '#147568',
  },
  {
    id: 'slow',
    title: 'Let the good\nthings unfold.',
    label: 'IN YOUR OWN TIME',
    mark: '↗',
    by: 'Sam Ellis',
    detail: 'Stay curious about what comes next.',
    color: '#844a6b',
  },
];

/** Original animated scenes keep the demo self-contained. Supply your own video in renderItem. */
function StoryScene({ story, active }: { story: (typeof stories)[number]; active: boolean }) {
  const insets = useSafeAreaInsets();
  const motion = useInteractionMotion();
  const clock = useSharedValue(0);
  useEffect(() => {
    if (active && motion)
      clock.set(
        withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
    else cancelAnimation(clock);
    return () => cancelAnimation(clock);
  }, [active, motion, clock]);
  const orbit = useAnimatedStyle(() => ({
    transform: [
      { translateY: clock.get() * 22 },
      { rotate: `${clock.get() * 18}deg` },
      { scale: 1 + clock.get() * 0.1 },
    ],
  }));
  return (
    <View
      style={[
        styles.scene,
        {
          backgroundColor: story.color,
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 96,
        },
      ]}
    >
      <View style={styles.progress}>
        {[0, 1, 2].map((segment) => (
          <View key={segment} style={[styles.segment, { opacity: segment === 0 ? 0.95 : 0.25 }]} />
        ))}
      </View>
      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{story.by[0]}</Text>
        </View>
        <View>
          <Text style={styles.author}>{story.by}</Text>
          <Text style={styles.caption}>A moment of perspective</Text>
        </View>
      </View>
      <Animated.View pointerEvents="none" style={[styles.orbit, orbit]}>
        <View style={styles.innerOrbit}>
          <View style={styles.core}>
            <Text style={styles.mark}>{story.mark}</Text>
          </View>
        </View>
      </Animated.View>
      <View style={styles.copy}>
        <Text style={styles.label}>{story.label}</Text>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.detail}>{story.detail}</Text>
      </View>
    </View>
  );
}

export default function CubeCarouselDemo() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <CubeCarousel
        data={stories}
        keyExtractor={(story) => story.id}
        index={index}
        onIndexChange={setIndex}
        testID="cube-carousel"
        renderItem={({ item, isActive }) => <StoryScene story={item} active={isActive} />}
      />
      <View style={[styles.controls, { bottom: insets.bottom + 20 }]}>
        <Pressable
          testID="cube-previous"
          accessibilityRole="button"
          accessibilityLabel="Previous story"
          disabled={index === 0}
          onPress={() => setIndex((current) => Math.max(0, current - 1))}
          style={[styles.control, index === 0 && styles.disabled]}
        >
          <Text style={styles.arrow}>←</Text>
        </Pressable>
        <View style={styles.counter}>
          <Text testID="cube-page" accessibilityLiveRegion="polite" style={styles.page}>
            {index + 1} / {stories.length}
          </Text>
          <Text style={styles.hint}>SWIPE TO EXPLORE</Text>
        </View>
        <Pressable
          testID="cube-next"
          accessibilityRole="button"
          accessibilityLabel="Next story"
          disabled={index === stories.length - 1}
          onPress={() => setIndex((current) => Math.min(stories.length - 1, current + 1))}
          style={[styles.control, index === stories.length - 1 && styles.disabled]}
        >
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
      <View pointerEvents="none" style={[styles.outline, { borderColor: colors.border }]} />
    </View>
  );
}

const ink = theme.dark.foreground;
const styles = StyleSheet.create({
  root: { flex: 1 },
  scene: { flex: 1, paddingHorizontal: 25, overflow: 'hidden' },
  progress: { flexDirection: 'row', gap: 4, marginBottom: 18 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffffff70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 13, color: ink },
  author: { fontSize: 13, fontWeight: '600', color: ink },
  caption: { fontSize: 10, color: ink, opacity: 0.6, marginTop: 3 },
  orbit: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: '#ffffff45',
    top: '22%',
    left: '13%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerOrbit: {
    width: 276,
    height: 276,
    borderRadius: 138,
    borderWidth: 1,
    borderColor: '#ffffff45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: '#ffffff55',
    backgroundColor: '#ffffff0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { fontSize: 90, color: ink, opacity: 0.65 },
  copy: { marginTop: 'auto', gap: 14, paddingTop: 200 },
  label: { fontSize: 9, color: ink, opacity: 0.65, letterSpacing: 2 },
  title: { fontSize: 45, lineHeight: 48, letterSpacing: -2, fontWeight: '500', color: ink },
  detail: { fontSize: 13, lineHeight: 21, color: ink, opacity: 0.65, maxWidth: 245 },
  controls: {
    position: 'absolute',
    left: 25,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  control: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ffffff40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { fontSize: 20, color: ink },
  counter: { alignItems: 'center', gap: 6 },
  page: { fontSize: 12, color: ink },
  hint: { fontSize: 8, letterSpacing: 1.6, color: ink, opacity: 0.55 },
  disabled: { opacity: 0.3 },
  outline: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    pointerEvents: 'none',
  },
});
