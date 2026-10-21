import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from '../ui/search-bar';
import { theme, useTheme } from '../ui/theme';

const DISHES = [
  'Search "ramen"',
  'Search "pancakes"',
  'Search "tacos"',
  'Search "falafel"',
  'Search "dumplings"',
];
const DRINKS = [
  'Search "smoothies"',
  'Search "iced tea"',
  'Search "lemonade"',
  'Search "hot cocoa"',
];

export default function SearchBarDemo() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('Pad Thai');
  const heading = [styles.heading, { color: colors.mutedForeground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Default</Text>
      <SearchBar placeholders={DISHES} testID="search-bar-default" />

      <Text style={heading}>With mic</Text>
      <SearchBar
        placeholders={DRINKS}
        trailing={
          <View style={styles.trailing}>
            <View style={[styles.divider, { backgroundColor: colors.mutedForeground }]} />
            <Mic color={colors.primary} />
          </View>
        }
        testID="search-bar-mic"
      />

      <Text style={heading}>Typed text</Text>
      <SearchBar
        placeholders={DISHES}
        value={query}
        onChangeText={setQuery}
        trailing={
          query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={theme.spacing.sm}
              onPress={() => setQuery('')}
              testID="search-bar-clear"
            >
              <Clear color={colors.mutedForeground} />
            </Pressable>
          ) : null
        }
        testID="search-bar-typed"
      />
      <Text style={[styles.hint, { color: colors.mutedForeground }]} testID="search-bar-typed-echo">
        {query ? `Results for "${query}"` : 'The placeholder is back while the bar is empty'}
      </Text>
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

/** A filled circle with an × cut out of it. */
function Clear({ color }: { color: string }) {
  const { colors } = useTheme();
  const stroke = [styles.clearStroke, { backgroundColor: colors.background }];
  return (
    <View style={[styles.clear, { backgroundColor: color }]}>
      <View style={[stroke, styles.clearStrokeA]} />
      <View style={[stroke, styles.clearStrokeB]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
  },
  hint: {
    fontSize: theme.fontSize.sm,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  divider: {
    width: 1,
    height: 28,
    opacity: 0.35,
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
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearStroke: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    borderRadius: 1,
  },
  clearStrokeA: {
    transform: [{ rotate: '45deg' }],
  },
  clearStrokeB: {
    transform: [{ rotate: '-45deg' }],
  },
});
