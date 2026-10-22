import type { ReactNode } from 'react';
import {
  Image,
  type ImageSourcePropType,
  processColor,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { theme } from './theme';

/**
 * The footer keeps its own dark palette, separate from the light/dark theme. Give the screen
 * that ends in the footer this background too, so the art blends into it with no seam.
 */
export const FEED_FOOTER_BACKGROUND = '#131316';
/** Headline gradient stops, top to bottom. */
const COLORS: readonly string[] = ['#864c88', '#5f486d', '#383543'];
const FONT_SIZE = 35;
const LINE_HEIGHT = 35;
/** Share of each edge of the illustration that dissolves into the background. */
const DISSOLVE = { top: '22%', bottom: '34%', side: '18%' } as const;
/** Gradient stops per dissolve; enough that the eased ramp shows no bands. */
const STEPS = 12;
/** How far the headline rises into the bottom dissolve (percent of the footer width). */
const TUCK = '-14%';

export interface FeedFooterProps {
  /** Headline, one entry per line, shown uppercase. Keep each line short enough to fit. */
  lines: readonly string[];
  /** Vertical gradient stops for the headline, top to bottom, spaced evenly. */
  colors?: readonly string[];
  /**
   * Full-bleed art above the headline. Every edge dissolves into `backgroundColor` and the
   * headline rises into the bottom dissolve, so draw the art on that color with the subject
   * in the middle and quiet, dark edges.
   */
  illustration?: ImageSourcePropType;
  /** Wordmark or logo below the headline. */
  brand?: ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Branded block for the very end of a feed: optional illustration, a stacked display headline
 * with a vertical gradient across all its lines, and an optional brand slot. Static.
 */
export function FeedFooter({
  lines,
  colors = COLORS,
  illustration,
  brand,
  backgroundColor = FEED_FOOTER_BACKGROUND,
  style,
  testID,
}: FeedFooterProps) {
  const stops = colors.length > 0 ? colors : COLORS;
  const edge = (direction: 'top' | 'bottom' | 'left' | 'right') => ({
    // Unprefixed `backgroundImage` needs RN 0.87; this name works from 0.76.
    experimental_backgroundImage: dissolve(direction, backgroundColor),
  });

  return (
    <View
      style={[styles.root, illustration === undefined && styles.bare, { backgroundColor }, style]}
      testID={testID}
    >
      {illustration !== undefined && (
        // The ratio sits on a wrapper: Image applies a bundled asset's own size before `style`.
        <View style={[styles.illustration, { aspectRatio: aspectRatioOf(illustration) }]}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={illustration}
            style={styles.image}
          />
          <View style={[styles.dissolve, styles.top, edge('top')]} />
          <View style={[styles.dissolve, styles.bottom, edge('bottom')]} />
          <View style={[styles.dissolve, styles.left, edge('left')]} />
          <View style={[styles.dissolve, styles.right, edge('right')]} />
        </View>
      )}
      <Text style={[styles.headline, illustration !== undefined && styles.tucked]}>
        {lines.map((line, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional and may repeat
          <Text key={index} style={{ color: colorAt(stops, (index + 0.5) / lines.length) }}>
            {index > 0 ? '\n' : ''}
            {line}
          </Text>
        ))}
      </Text>
      {brand !== undefined && <View style={styles.brand}>{brand}</View>}
    </View>
  );
}

/** Width / height of a bundled image; 1 when unknown (e.g. a remote uri without a size). */
function aspectRatioOf(source: ImageSourcePropType): number {
  const asset = Image.resolveAssetSource(source);
  return asset?.width && asset.height ? asset.width / asset.height : 1;
}

/** `[r, g, b, a]` of any color React Native parses; undefined for platform colors. */
function channels(color: string): readonly [number, number, number, number] | undefined {
  const value = processColor(color);
  if (typeof value !== 'number') return undefined;
  const argb = value >>> 0;
  return [(argb >>> 16) & 255, (argb >>> 8) & 255, argb & 255, (argb >>> 24) / 255];
}

/**
 * Gradient from clear to `color` toward `direction`, with a smoothstep alpha ramp: the ramp
 * starts and ends flat, so neither end of the dissolve reads as a line.
 */
function dissolve(direction: 'top' | 'bottom' | 'left' | 'right', color: string): string {
  const rgba = channels(color);
  if (!rgba) return `linear-gradient(to ${direction}, transparent, ${color})`;
  const [r, g, b, alpha] = rgba;
  const stops = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    const a = alpha * t * t * (3 - 2 * t);
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to ${direction}, ${stops.join(', ')})`;
}

/**
 * Color at `t` (0 top, 1 bottom) of a gradient through evenly spaced `stops`. RN can't clip a
 * gradient to text without a native mask, so each line gets the color at its vertical center.
 */
function colorAt(stops: readonly string[], t: number): string {
  const position = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const index = Math.max(0, Math.min(Math.floor(position), stops.length - 2));
  const from = stops[index] ?? FEED_FOOTER_BACKGROUND;
  const to = stops[index + 1] ?? from;
  const k = position - index;
  const a = channels(from);
  const b = channels(to);
  if (!a || !b) return k < 0.5 ? from : to;
  const mix = (x: number, y: number) => x + (y - x) * k;
  const channel = (i: 0 | 1 | 2) => Math.round(mix(a[i], b[i]));
  return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${mix(a[3], b[3])})`;
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: theme.spacing.xl * 2,
  },
  /** No art: keep the headline off the top edge. */
  bare: {
    paddingTop: theme.spacing.xl,
  },
  illustration: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dissolve: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  top: { top: 0, left: 0, right: 0, height: DISSOLVE.top },
  bottom: { bottom: 0, left: 0, right: 0, height: DISSOLVE.bottom },
  left: { top: 0, bottom: 0, left: 0, width: DISSOLVE.side },
  right: { top: 0, bottom: 0, right: 0, width: DISSOLVE.side },
  headline: {
    paddingHorizontal: theme.spacing.lg,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    fontWeight: '800',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  /** Rise into the bottom dissolve so the text starts just under the last visible art. */
  tucked: {
    marginTop: TUCK,
  },
  brand: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
});
