import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, useTheme } from '../ui/theme';

export function AIToolDemo({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / AI INTERFACES</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      {children}
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Local demo data. No tools, models, or services are called.
      </Text>
    </ScrollView>
  );
}

export function AIDemoAction({
  label,
  onPress,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.action, { backgroundColor: selected ? colors.primary : colors.muted }]}
    >
      <Text
        style={{
          color: selected ? colors.primaryForeground : colors.foreground,
          fontSize: 11,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AIDemoRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}
const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 36, paddingBottom: 48, gap: 20 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -1.4, fontWeight: '600', marginTop: 6 },
  description: { fontSize: 13, lineHeight: 22, marginBottom: 4 },
  footer: { fontSize: 10, lineHeight: 17, marginTop: 6 },
  action: {
    minHeight: 38,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
