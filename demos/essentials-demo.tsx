import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, useTheme } from '../ui/theme';

export function EssentialsDemo({
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
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.mint }]}>POCKETUI / EVERYDAY INTERACTIONS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      {children}
    </View>
  );
}
export function DemoButton({
  children,
  onPress,
  testID,
  secondary = false,
}: {
  children: string;
  onPress: () => void;
  testID: string;
  secondary?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? colors.muted : colors.primary, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: secondary ? colors.foreground : colors.primaryForeground },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export const demoStyles = StyleSheet.create({
  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 16, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  text: { fontSize: 14, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 19 },
  section: { gap: 12, marginTop: 16 },
});
const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 44, gap: 16 },
  eyebrow: { fontSize: 9, letterSpacing: 1.6, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '600', letterSpacing: -1, marginTop: 12 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  button: {
    minHeight: 48,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 14, fontWeight: '600' },
});
