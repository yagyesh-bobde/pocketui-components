import { StyleSheet, Text, View } from 'react-native';
import { FEED_FOOTER_BACKGROUND, FeedFooter } from '../ui/feed-footer';
import { theme } from '../ui/theme';

const PLANS = [
  { title: 'Rooftop jazz session', detail: 'Fri, 9 PM · 1.2 km' },
  { title: 'Midnight ramen crawl', detail: 'Sat, 11 PM · 3.4 km' },
  { title: 'Open-air cinema', detail: 'Sun, 8 PM · 2.0 km' },
] as const;

/** The footer keeps its own dark palette, so the screen that ends in it is dark in both schemes. */
const colors = theme.dark;

/** A short feed of placeholder cards that ends in the footer, on the footer's background. */
export default function FeedFooterDemo() {
  return (
    <View style={styles.screen}>
      <View style={styles.feed}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Tonight near you</Text>
        {PLANS.map((plan) => (
          <View
            key={plan.title}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.media, { backgroundColor: colors.muted }]} />
            <Text style={[styles.title, { color: colors.foreground }]}>{plan.title}</Text>
            <Text style={[styles.detail, { color: colors.mutedForeground }]}>{plan.detail}</Text>
          </View>
        ))}
        <View style={[styles.more, { backgroundColor: colors.muted }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>See all plans</Text>
        </View>
      </View>
      <FeedFooter
        lines={['Made for', 'nights', 'out']}
        illustration={require('./assets/feed-footer/street.webp')}
        brand={<Text style={styles.wordmark}>pocketui</Text>}
        testID="feed-footer"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: FEED_FOOTER_BACKGROUND,
  },
  feed: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  card: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  media: {
    height: 140,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  detail: {
    fontSize: theme.fontSize.sm,
  },
  more: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: 999,
  },
  wordmark: {
    color: '#403f49',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
});
