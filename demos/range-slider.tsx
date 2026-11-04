import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RangeSlider } from '../ui/range-slider';
import { useTheme } from '../ui/theme';

export default function RangeSliderDemo() {
  const { colors } = useTheme();
  const [volume, setVolume] = useState(65);
  const [settled, setSettled] = useState(65);
  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
        POCKETUI / RANGE SLIDER
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Find your level.</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Slide into the moment. Fine-tune it one step at a time.
      </Text>
      <View style={[styles.card, { backgroundColor: colors.muted }]}>
        <RangeSlider
          label="Volume"
          value={volume}
          onValueChange={setVolume}
          onSlidingComplete={setSettled}
          unit="%"
          testID="range-slider-volume"
        />
        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
        >{`Settled at ${settled}%. Just right.`}</Text>
      </View>
      <RangeSlider
        label="Daily pause"
        min={5}
        max={60}
        step={5}
        defaultValue={25}
        unit="min"
        testID="range-slider-steps"
      />
      <RangeSlider
        label="Playback speed"
        min={0.5}
        max={2}
        step={0.25}
        defaultValue={1}
        unit="×"
        testID="range-slider-decimal"
      />
      <RangeSlider
        label="Saved level"
        defaultValue={40}
        unit="%"
        disabled
        testID="range-slider-disabled"
      />
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
