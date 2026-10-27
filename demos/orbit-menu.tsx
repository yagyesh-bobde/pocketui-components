import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OrbitMenu } from '../ui/orbit-menu';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

const tools = [
  { key: 'note', label: 'Note', icon: '≡', detail: 'A blank page. A fresh thought.' },
  { key: 'photo', label: 'Photo', icon: '▧', detail: 'Keep something worth looking at.' },
  { key: 'voice', label: 'Voice', icon: '∿', detail: 'Some ideas sound better out loud.' },
  { key: 'sketch', label: 'Sketch', icon: '✎', detail: 'Follow the line. See where it goes.' },
];

export default function OrbitMenuDemo() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<(typeof tools)[number] | null>(null);
  return (
    <PlayfulDemo
      number="03"
      title="Follow the impulse."
      description="One little button. A whole orbit of possibilities."
    >
      <View style={[styles.canvas, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <View style={[styles.paper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.mark, { color: colors.mint }]}>{selected?.icon ?? '✺'}</Text>
          <Text style={[styles.paperTitle, { color: colors.foreground }]}>
            {selected ? `${selected.label}, started.` : 'Make a little something.'}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.paperDetail, { color: colors.mutedForeground }]}
          >
            {selected?.detail ?? 'It does not have to be a masterpiece.'}
          </Text>
        </View>
        <OrbitMenu
          testID="orbit-menu"
          label="What will you make?"
          actions={tools.map((tool) => ({
            ...tool,
            icon: <Text style={{ fontSize: 24, color: colors.foreground }}>{tool.icon}</Text>,
            onPress: () => setSelected(tool),
          }))}
        />
      </View>
      <PlayAgain testID="orbit-reset" onPress={() => setSelected(null)} />
    </PlayfulDemo>
  );
}

const styles = StyleSheet.create({
  canvas: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 12 },
  paper: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    transform: [{ rotate: '-3deg' }],
  },
  mark: { fontSize: 34 },
  paperTitle: { fontSize: 18, fontWeight: '500', letterSpacing: -0.5 },
  paperDetail: { fontSize: 12, lineHeight: 19, minHeight: 38 },
});
