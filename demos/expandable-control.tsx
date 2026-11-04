import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExpandableControl } from '../ui/expandable-control';
import { theme, useTheme } from '../ui/theme';

export default function ExpandableControlDemo() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('All notes');
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / CONTROLS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>A little room{'\n'}for more.</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Keep the everyday simple. Bring the extra controls into view when you need them.
      </Text>
      <ExpandableControl label="Filter your notes" defaultOpen testID="expandable-filter">
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          A SMALL CHANGE OF FOCUS
        </Text>
        <View style={styles.row}>
          {['All notes', 'Unread', 'Pinned'].map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === name }}
              onPress={() => setFilter(name)}
              style={[
                styles.chip,
                { backgroundColor: filter === name ? colors.primary : colors.muted },
              ]}
            >
              <Text
                style={{
                  color: filter === name ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text
          style={{ color: colors.mutedForeground, fontSize: 12 }}
        >{`Showing ${filter.toLowerCase()}.`}</Text>
      </ExpandableControl>
      <ExpandableControl label="Reading preferences" testID="expandable-reading">
        <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 22 }}>
          A quieter layout, a little more space, and all your attention on the words.
        </Text>
      </ExpandableControl>
      <ExpandableControl label="Team controls" disabled>
        <Text>Team settings</Text>
      </ExpandableControl>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Measured height. Your controls. Nothing extra.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 20 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: '600', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 23, marginBottom: 12 },
  caption: { fontSize: 9, letterSpacing: 1.5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  footer: { fontSize: 11, lineHeight: 18, marginTop: 12 },
});
