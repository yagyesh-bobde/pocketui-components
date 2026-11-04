import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedBadge } from '../ui/animated-badge';
import { theme, useTheme } from '../ui/theme';

export default function AnimatedBadgeDemo() {
  const { colors } = useTheme();
  const [pulse, setPulse] = useState(true);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / STATUS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Small signals.{'\n'}Clear meaning.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A calm pulse for something live. A steady dot for everything else.
      </Text>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>YOUR WORKSPACE</Text>
        <AnimatedBadge label="All systems operational" pulse={pulse} />
        <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 19 }}>
          A little reassurance, without asking for attention.
        </Text>
      </View>
      <View style={styles.states}>
        <AnimatedBadge label="Draft saved" variant="neutral" pulse={false} />
        <AnimatedBadge label="Sync pending" variant="warning" pulse={pulse} />
        <AnimatedBadge label="Connection lost" variant="danger" pulse={pulse} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pulse ? 'Pause badge motion' : 'Resume badge motion'}
        onPress={() => setPulse((value) => !value)}
        style={[styles.button, { backgroundColor: colors.muted }]}
      >
        <Text style={{ color: colors.foreground, fontSize: 13 }}>
          {pulse ? 'Pause motion' : 'Resume motion'}
        </Text>
      </Pressable>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        System reduced motion keeps every status readable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 22 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: '600', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 23 },
  card: { borderWidth: 1, borderRadius: 20, padding: 22, gap: 20 },
  caption: { fontSize: 9, letterSpacing: 1.5 },
  states: { gap: 20, paddingVertical: 6 },
  button: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  footer: { fontSize: 11, lineHeight: 18, textAlign: 'center' },
});
