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

/** The footer keeps its own dark palette, separate from the light/dark theme. */
const BACKGROUND = '#131316';
/** Headline gradient stops, top to bottom. */
const COLORS: readonly string[] = ['#864c88', '#5f486d', '#383543'];
const FONT_SIZE = 35;
const LINE_HEIGHT = 35;
/** Bottom share of the illustration that dissolves into the background. */
const FADE = '30%';

export interface FeedFooterProps {
  /** Headline, one entry per line, shown uppercase. Keep each line short enough to fit. */
  lines: readonly string[];
  /** Vertical gradient stops for the headline, top to bottom, spaced evenly. */
  colors?: readonly string[];
  /** Full-bleed art above the headline. Its bottom edge fades into `backgroundColor`. */
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
  backgroundColor = BACKGROUND,
  style,
  testID,
}: FeedFooterProps) {
  const stops = colors.length > 0 ? colors : COLORS;

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
          <View
            style={[
              styles.fade,
              {
                // Unprefixed `backgroundImage` needs RN 0.87; this name works from 0.76.
                experimental_backgroundImage: `linear-gradient(${transparent(backgroundColor)}, ${backgroundColor})`,
              },
            ]}
          />
        </View>
      )}
      <Text style={styles.headline}>
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

function transparent(color: string): string {
  const rgba = channels(color);
  return rgba ? `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0)` : 'transparent';
}

/**
 * Color at `t` (0 top, 1 bottom) of a gradient through evenly spaced `stops`. RN can't clip a
 * gradient to text without a native mask, so each line gets the color at its vertical center.
 */
function colorAt(stops: readonly string[], t: number): string {
  const position = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const index = Math.max(0, Math.min(Math.floor(position), stops.length - 2));
  const from = stops[index] ?? BACKGROUND;
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
  fade: {
    position: 'absolute',
    pointerEvents: 'none',
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE,
  },
  headline: {
    paddingHorizontal: theme.spacing.lg,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    fontWeight: '800',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  brand: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
});
