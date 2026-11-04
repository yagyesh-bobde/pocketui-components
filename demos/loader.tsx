import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Loader } from '../ui/loader';
import { theme, useTheme } from '../ui/theme';

export default function LoaderDemo() {
  const { colors } = useTheme();
  const [active, setActive] = useState(true);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / LOADING</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Good things{'\n'}take a moment.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A small sign that something is happening. Two useful shapes, at the right size.
      </Text>
      <View style={styles.row}>
        <View style={[styles.sample, { borderColor: colors.border }]}>
          <Loader size={32} />
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>SPINNER</Text>
        </View>
        <View style={[styles.sample, { borderColor: colors.border }]}>
          <Loader variant="dots" size={30} color={colors.success} />
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>DOTS</Text>
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.muted }]}>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
          Your next chapter.
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 21 }}>
          A loading state with a clear label, ready for your own request.
        </Text>
        <Loader
          active={active}
          variant="dots"
          label="Preparing your workspace"
          showLabel
          color={colors.success}
          size={18}
        />
        {!active && (
          <Text accessibilityLiveRegion="polite" style={{ color: colors.success, fontSize: 13 }}>
            Demo complete. Everything is ready.
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setActive((value) => !value)}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: '500' }}>
          {active ? 'Finish the demo' : 'Start again'}
        </Text>
      </Pressable>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        A demo state. Connect it to your own async work.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 22 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: '600', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 23 },
  row: { flexDirection: 'row', gap: 14 },
  sample: {
    flex: 1,
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  caption: { fontSize: 9, letterSpacing: 1.5 },
  card: { borderRadius: 20, padding: 22, gap: 16 },
  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  footer: { fontSize: 11, lineHeight: 18, textAlign: 'center' },
});
