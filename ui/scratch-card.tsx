import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, G, Line, Mask, Path, Rect, Text as SvgText } from 'react-native-svg';
import { createScratchTracker, type Point } from './playful-utils';
import { theme, useTheme } from './theme';

const stripePositions = Array.from({ length: 24 }, (_, index) => index * 28);

export interface ScratchCardProps {
  children: ReactNode;
  /** Public description, without the hidden reward. */
  accessibilityLabel: string;
  onReveal?: () => void;
  coverLabel?: string;
  height?: number;
  brushSize?: number;
  revealThreshold?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A tactile reveal, not a security boundary. Never place secrets in client-side children. */
export function ScratchCard({
  children,
  accessibilityLabel,
  onReveal,
  coverLabel = 'SCRATCH TO DISCOVER',
  height = 220,
  brushSize = 42,
  revealThreshold = 0.45,
  style,
  testID,
}: ScratchCardProps) {
  const { colors } = useTheme();
  const mask = `scratch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [path, setPath] = useState('');
  const [revealed, setRevealed] = useState(false);
  const done = useRef(false);
  const previous = useRef<Point | null>(null);
  const trace = useRef('');
  const samples = useRef(0);
  const brush = Number.isFinite(brushSize) ? Math.max(20, Math.min(80, brushSize)) : 42;
  const threshold = Number.isFinite(revealThreshold)
    ? Math.max(0.1, Math.min(0.9, revealThreshold))
    : 0.45;
  const tracker = useRef(createScratchTracker(0, 0, brush));
  useEffect(() => {
    tracker.current = createScratchTracker(size.width, size.height, brush);
    previous.current = null;
    trace.current = '';
    samples.current = 0;
    setPath('');
  }, [size.width, size.height, brush]);
  const reveal = () => {
    if (done.current) return;
    done.current = true;
    previous.current = null;
    setRevealed(true);
    onReveal?.();
  };
  const scratch = (x: number, y: number, start: boolean) => {
    if (done.current || size.width === 0) return;
    const point = {
      x: Math.max(0, Math.min(size.width, x)),
      y: Math.max(0, Math.min(size.height, y)),
    };
    const last = start ? null : previous.current;
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 3) return;
    trace.current += `${last ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}${last ? '' : `l0.1,0`}`;
    previous.current = point;
    setPath(trace.current);
    if (tracker.current.add(last ?? point, point) >= threshold || ++samples.current >= 2000)
      reveal();
  };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => !done.current,
    onPanResponderGrant: (event) =>
      scratch(event.nativeEvent.locationX, event.nativeEvent.locationY, true),
    onPanResponderMove: (event) =>
      scratch(event.nativeEvent.locationX, event.nativeEvent.locationY, false),
    onPanResponderRelease: () => {
      previous.current = null;
    },
    onPanResponderTerminate: () => {
      previous.current = null;
    },
    onPanResponderTerminationRequest: () => false,
  });
  return (
    <View style={[styles.root, style]} testID={testID}>
      <View
        style={[
          styles.card,
          {
            height: Number.isFinite(height) ? Math.max(140, Math.min(500, height)) : 220,
            borderColor: colors.border,
          },
        ]}
        onLayout={(event) => {
          const { width, height: nextHeight } = event.nativeEvent.layout;
          if (width === size.width && nextHeight === size.height) return;
          setSize({ width, height: nextHeight });
        }}
      >
        <View
          style={styles.reward}
          pointerEvents={revealed ? 'auto' : 'none'}
          accessibilityElementsHidden={!revealed}
          importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}
        >
          {children}
        </View>
        {!revealed && (
          <View
            {...pan.panHandlers}
            style={StyleSheet.absoluteFill}
            accessible
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityHint="Scratch the card or activate to reveal"
            accessibilityActions={[{ name: 'activate', label: 'Reveal card' }]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'activate') reveal();
            }}
          >
            {size.width > 0 && size.height > 0 ? (
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${size.width} ${size.height}`}
                pointerEvents="none"
                accessible={false}
              >
                <Defs>
                  <Mask
                    id={mask}
                    x={0}
                    y={0}
                    width={size.width}
                    height={size.height}
                    maskUnits="userSpaceOnUse"
                  >
                    <Rect width={size.width} height={size.height} fill="white" />
                    <Path
                      d={path || 'M0,0'}
                      fill="none"
                      stroke="black"
                      strokeWidth={brush}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Mask>
                </Defs>
                <G mask={`url(#${mask})`}>
                  <Rect width={size.width} height={size.height} fill={colors.muted} />
                  {stripePositions.map((position) => (
                    <Line
                      key={position}
                      x1={position - 220}
                      y1={0}
                      x2={position}
                      y2={500}
                      stroke={colors.border}
                      strokeWidth={1}
                    />
                  ))}
                  <SvgText
                    x="50%"
                    y="43%"
                    textAnchor="middle"
                    fill={colors.foreground}
                    fontSize={34}
                  >
                    ✦
                  </SvgText>
                  <SvgText
                    x="50%"
                    y="62%"
                    textAnchor="middle"
                    fill={colors.foreground}
                    fontSize={11}
                    fontWeight="600"
                    letterSpacing={2}
                  >
                    {coverLabel}
                  </SvgText>
                  <SvgText
                    x="50%"
                    y="75%"
                    textAnchor="middle"
                    fill={colors.mutedForeground}
                    fontSize={11}
                  >
                    A little curiosity looks good on you.
                  </SvgText>
                </G>
              </Svg>
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted }]} />
            )}
          </View>
        )}
      </View>
      <Pressable
        testID={testID ? `${testID}-reveal` : undefined}
        accessibilityRole="button"
        disabled={revealed}
        accessibilityState={{ disabled: revealed }}
        onPress={reveal}
        style={styles.alternative}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.link, { color: colors.mutedForeground }]}
        >
          {revealed ? 'Revealed ✦' : 'Reveal without scratching ↗'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  card: { overflow: 'hidden', borderRadius: 22, borderWidth: 1 },
  reward: { flex: 1 },
  alternative: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  link: { fontSize: theme.fontSize.sm - 2 },
});
