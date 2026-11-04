import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Alert, type AlertVariant } from '../ui/alert';
import { theme, useTheme } from '../ui/theme';

export default function AlertDemo() {
  const { colors } = useTheme();
  const [variant, setVariant] = useState<AlertVariant>('success');
  const [visible, setVisible] = useState(true);
  const text =
    variant === 'success'
      ? {
          title: 'Everything is up to date.',
          description: 'Your latest changes are saved on this device.',
        }
      : variant === 'error'
        ? { title: 'Couldn’t connect.', description: 'Your work is safe here. Try syncing again.' }
        : variant === 'warning'
          ? {
              title: 'You’re almost out of space.',
              description: 'Archive a few old files to make room for new ideas.',
            }
          : {
              title: 'A quieter way to stay in the loop.',
              description: 'Only the updates you need, right where they belong.',
            };
  return (
    <View style={styles.screen}>
      <Text style={[styles.heading, { color: colors.foreground }]}>Good to know.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Inline feedback that stays until you’re ready to dismiss it.
      </Text>
      {visible ? (
        <Alert
          key={variant}
          {...text}
          variant={variant}
          testID="alert-message"
          onDismiss={() => setVisible(false)}
          action={
            variant === 'error'
              ? { label: 'Try again', onPress: () => setVariant('success') }
              : undefined
          }
        />
      ) : null}
      <View style={styles.choices}>
        {(['default', 'success', 'warning', 'error'] as const).map((tone) => (
          <Pressable
            key={tone}
            accessibilityRole="button"
            accessibilityState={{ selected: tone === variant && visible }}
            onPress={() => {
              setVariant(tone);
              setVisible(true);
            }}
            testID={`alert-${tone}`}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: tone === variant ? colors.primary : colors.muted,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: tone === variant ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {tone[0]?.toUpperCase()}
              {tone.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Alert
        title="Made for the moment."
        description="No timer. No interruption. Just a useful note beside the content it belongs to."
        animate={false}
      />
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Try the error state, then retry. Dismiss a message and choose a variant to show it again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, gap: theme.spacing.xl },
  heading: { fontSize: 28, fontWeight: theme.fontWeight.semibold, letterSpacing: -0.8 },
  copy: { fontSize: theme.fontSize.sm, lineHeight: 22 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  button: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: theme.fontWeight.medium },
});
