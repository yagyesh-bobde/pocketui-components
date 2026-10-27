import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RulerPicker } from '../ui/ruler-picker';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

export default function RulerPickerDemo() {
  const { colors } = useTheme();
  const [value, setValue] = useState(25);
  return (
    <PlayfulDemo
      number="04"
      title="Find your sweet spot."
      description="A little less. A little more. Slide until it feels just right."
    >
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.mark, { color: colors.mint }]}>◴</Text>
        <RulerPicker
          testID="ruler"
          label="Your daily pause"
          min={5}
          max={60}
          value={value}
          onValueChange={setValue}
          unit="min"
        />
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          MAKE A LITTLE ROOM FOR YOURSELF.
        </Text>
      </View>
      <PlayAgain testID="ruler-reset" onPress={() => setValue(25)} />
    </PlayfulDemo>
  );
}
const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 24, paddingVertical: 28, overflow: 'hidden' },
  mark: { fontSize: 40, textAlign: 'center' },
  caption: { fontSize: 8, letterSpacing: 1.3, textAlign: 'center', paddingHorizontal: 12 },
});
