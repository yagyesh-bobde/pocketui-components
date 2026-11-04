import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Select, type SelectOption } from '../ui/select';
import { useTheme } from '../ui/theme';

const options: readonly SelectOption[] = [
  { value: 'espresso', label: 'Espresso', description: 'Small, bold, and straight to the point.' },
  { value: 'flat-white', label: 'Flat white', description: 'A little softer around the edges.' },
  { value: 'filter', label: 'Filter coffee', description: 'Take your time with this one.' },
  { value: 'cold-brew', label: 'Cold brew', description: 'Back tomorrow.', disabled: true },
];

export default function SelectDemo() {
  const { colors } = useTheme();
  const [coffee, setCoffee] = useState('flat-white');
  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>POCKETUI / SELECT</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>One good choice.</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A clear list. A little context. A native choice that feels right.
      </Text>
      <View style={[styles.card, { backgroundColor: colors.muted }]}>
        <Select
          label="Your usual"
          options={options}
          value={coffee}
          onValueChange={setCoffee}
          testID="select-coffee"
        />
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {options.find((option) => option.value === coffee)?.description}
        </Text>
      </View>
      <Select
        label="Something different"
        placeholder="Choose your next coffee"
        options={options}
        testID="select-uncontrolled"
      />
      <Select
        label="Already on its way"
        options={options}
        defaultValue="espresso"
        disabled
        testID="select-disabled"
      />
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Pick a row to confirm. Cancel or tap outside to keep your current choice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: 24, paddingTop: 32, gap: 24 },
  eyebrow: { fontSize: 10, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '600', letterSpacing: -1 },
  description: { fontSize: 13, lineHeight: 21 },
  card: { padding: 20, borderRadius: 20, gap: 16 },
});
