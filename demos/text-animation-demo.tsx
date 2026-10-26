import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, useTheme } from '../ui/theme';

/** Shared presentation for the text demos; remounting the stage replays one-shot effects. */
export function TextAnimationDemo({
  title,
  description,
  index,
  children,
}: {
  title: string;
  description: string;
  index: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const [replay, setReplay] = useState(0);
  return (
    <View style={styles.screen}>
      <View style={styles.topline}>
        <View style={[styles.dot, { backgroundColor: colors.mint }]} />
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          POCKETUI / TEXT {index}
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      <View style={[styles.stage, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.stageLabel, { color: colors.mutedForeground }]}>
          A LITTLE MOTION. A LITTLE FEELING.
        </Text>
        <View key={replay} style={styles.content}>
          {children}
        </View>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          Made for the everyday.
        </Text>
      </View>
      <Pressable
        testID="text-animation-replay"
        accessibilityRole="button"
        accessibilityLabel="Replay animation"
        onPress={() => setReplay((value) => value + 1)}
        style={[styles.replay, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.replayText, { color: colors.primaryForeground }]}>
          Replay animation ↻
        </Text>
      </Pressable>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Native text. System-aware motion.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: theme.spacing.lg },
  topline: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 30, fontWeight: '600', letterSpacing: -1, marginTop: theme.spacing.lg },
  description: { fontSize: 14, lineHeight: 22 },
  stage: {
    minHeight: 340,
    padding: theme.spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: theme.spacing.lg,
  },
  stageLabel: { fontSize: 9, letterSpacing: 1.5, lineHeight: 16 },
  content: { flex: 1, minHeight: 220, justifyContent: 'center', paddingVertical: theme.spacing.xl },
  rule: { height: 1, marginBottom: theme.spacing.md },
  caption: { fontSize: 12 },
  replay: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.sm,
  },
  replayText: { fontSize: 14, fontWeight: '600' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: theme.spacing.xs },
});
