import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MorphingModal } from '../ui/morphing-modal';
import { theme, useTheme } from '../ui/theme';

export default function MorphingModalDemo() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / SURFACES</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        A little card.{'\n'}A bigger story.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Open the details without losing where you started.
      </Text>
      <MorphingModal
        open={open}
        onOpenChange={setOpen}
        accessibilityLabel="A weekend in Kyoto"
        sourceRadius={24}
        testID="travel-modal"
        trigger={
          <View
            style={[
              styles.card,
              { backgroundColor: colors.successSurface, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.success, fontSize: 10, letterSpacing: 2 }}>
              SLOW TRAVEL / NO. 04
            </Text>
            <Text style={[styles.art, { color: colors.success }]}>京都</Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 24,
                fontWeight: '600',
                letterSpacing: -0.7,
              }}
            >
              A weekend in Kyoto
            </Text>
            <View style={styles.row}>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                Two days. No hurry.
              </Text>
              <Text style={{ color: colors.success, fontSize: 18 }}>↗</Text>
            </View>
          </View>
        }
      >
        <View style={[styles.banner, { backgroundColor: colors.successSurface }]}>
          <Text style={{ color: colors.success, fontSize: 46, letterSpacing: 6 }}>京都</Text>
          <Text style={{ color: colors.success, fontSize: 10, letterSpacing: 2 }}>
            FIND YOUR OWN PACE
          </Text>
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 14, lineHeight: 24 }}>
          A short itinerary for long walks, quiet gardens, and one more cup of tea.
        </Text>
        {[
          [
            '01',
            'Arrive slowly.',
            'An early walk by the river. A small coffee shop. No plans until lunch.',
          ],
          [
            '02',
            'Take the quieter path.',
            'A garden before the crowds. A bookstore in the afternoon. Stay for the light.',
          ],
        ].map(([number, title, description]) => (
          <View key={number} style={styles.day}>
            <Text style={{ color: colors.success, fontSize: 11 }}>{number}</Text>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '600' }}>
                {title}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 20 }}>
                {description}
              </Text>
            </View>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSaved(true);
            setOpen(false);
          }}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: '500' }}>
            {saved ? 'Saved to your collection' : 'Save this little escape'}
          </Text>
        </Pressable>
      </MorphingModal>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.footer, { color: saved ? colors.success : colors.mutedForeground }]}
      >
        {saved
          ? 'A little escape, saved for later.'
          : 'Tap the card to expand. Close it to return.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 22 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: '600', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 23 },
  card: { borderRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  art: { fontSize: 80, lineHeight: 120, letterSpacing: 10, textAlign: 'center', marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  banner: { padding: 22, gap: 12, alignItems: 'center', borderRadius: 16 },
  day: { flexDirection: 'row', gap: 14, paddingVertical: 6 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  footer: { fontSize: 11, lineHeight: 18 },
});
