import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MultiSelect } from '../ui/multi-select';
import type { SelectOption } from '../ui/select';
import { useTheme } from '../ui/theme';

const options: readonly SelectOption[] = [
  { value: 'design', label: 'Design', description: 'Small details, better experiences.' },
  { value: 'engineering', label: 'Engineering', description: 'Build something that holds up.' },
  { value: 'music', label: 'Music', description: 'Find your next favorite sound.' },
  { value: 'photography', label: 'Photography', description: 'See the everyday differently.' },
  { value: 'travel', label: 'Travel', description: 'Coming soon.', disabled: true },
];

export default function MultiSelectDemo() {
  const { colors } = useTheme();
  const [interests, setInterests] = useState<string[]>(['design', 'music']);
  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
        POCKETUI / MULTI SELECT
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>More than one thing.</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Make a little room for everything you’re into.
      </Text>
      <View style={[styles.card, { backgroundColor: colors.muted }]}>
        <MultiSelect
          label="Your interests"
          options={options}
          value={interests}
          onValueChange={setInterests}
          testID="multi-select-interests"
        />
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {interests.length
            ? `${interests.length} good reasons to stay curious.`
            : 'A fresh start. Choose something you love.'}
        </Text>
      </View>
      <MultiSelect
        label="Explore something new"
        options={options}
        placeholder="Pick a few interests"
        testID="multi-select-uncontrolled"
      />
      <MultiSelect
        label="Saved collection"
        options={options}
        defaultValue={['engineering']}
        disabled
        testID="multi-select-disabled"
      />
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Make your picks, then tap Done. Cancel leaves your saved choices alone.
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
