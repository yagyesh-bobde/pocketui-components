import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, useTheme } from '../ui/theme';

export function PlayfulDemo({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.screen}>
      <View style={styles.topline}>
        <View style={[styles.dot, { backgroundColor: colors.mint }]} />
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          POCKETUI / PLAY {number}
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      {children}
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        SMALL INTERACTIONS. BIG PERSONALITY.
      </Text>
    </View>
  );
}

export function PlayAgain({ onPress, testID }: { onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Start again"
      onPress={onPress}
      style={[styles.again, { borderColor: colors.border }]}
    >
      <Text style={[styles.againText, { color: colors.foreground }]}>Start again ↻</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 20 },
  topline: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  eyebrow: { fontSize: 9, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 36, letterSpacing: -1.5, fontWeight: '600', marginTop: 20 },
  description: { fontSize: 14, lineHeight: 23, marginBottom: 16 },
  rule: { height: 1, marginTop: 16 },
  footer: { fontSize: 8, letterSpacing: 1.8 },
  again: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  againText: { fontSize: 13, fontWeight: '500' },
});
