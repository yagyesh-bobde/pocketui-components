import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { ColorPicker } from '../ui/color-picker';
import { useTheme } from '../ui/theme';

export default function ColorPickerDemo() {
  const { colors } = useTheme();
  const [color, setColor] = useState('#047857');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.root, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          POCKETUI / COLOR PICKER
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>A color of your own.</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Start with a swatch. Or bring the exact shade you had in mind.
        </Text>
        <ColorPicker
          label="Your accent"
          value={color}
          onValueChange={setColor}
          testID="color-picker-accent"
        />
        <ColorPicker
          label="Saved palette"
          defaultValue="#2563EB"
          palette={['#2563EB', '#7C3AED', '#DB2777']}
          disabled
          testID="color-picker-disabled"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: 24, paddingTop: 32, gap: 24 },
  eyebrow: { fontSize: 10, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '600', letterSpacing: -1 },
  description: { fontSize: 13, lineHeight: 21 },
});
