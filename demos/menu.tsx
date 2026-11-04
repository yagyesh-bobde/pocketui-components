import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu } from '../ui/menu';
import { theme, useTheme } from '../ui/theme';

export default function MenuDemo() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('All your ideas, in one little place.');
  const trigger = (
    <View style={[styles.trigger, { backgroundColor: colors.primary }]}>
      <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: '500' }}>
        Project actions
      </Text>
      <Text style={{ color: colors.primaryForeground, fontSize: 14 }}>⌄</Text>
    </View>
  );
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>POCKETUI / MENUS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        The next action.{'\n'}Right here.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        A focused list of actions, anchored to where you asked for them.
      </Text>
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={[styles.mark, { backgroundColor: colors.successSurface }]}>
          <Text style={{ fontSize: 30, color: colors.success }}>✳</Text>
        </View>
        <Text
          style={{ color: colors.foreground, fontSize: 22, fontWeight: '600', letterSpacing: -0.5 }}
        >
          Field notes
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 22 }}
        >
          {message}
        </Text>
        <Menu
          trigger={trigger}
          accessibilityLabel="Field notes actions"
          testID="project-menu"
          items={[
            {
              key: 'edit',
              label: 'Rename project',
              description: 'Give this space a new name',
              onSelect: () => setMessage('Rename selected. Ready for your editor.'),
            },
            {
              key: 'duplicate',
              label: 'Duplicate',
              description: 'Start with a familiar shape',
              onSelect: () => setMessage('A demo copy is ready to make your own.'),
            },
            {
              key: 'share',
              label: 'Share with team',
              description: 'Available when a team is connected',
              disabled: true,
              onSelect: () => {},
            },
            {
              key: 'archive',
              label: 'Archive project',
              destructive: true,
              onSelect: () =>
                setMessage('Archive selected in this demo. Your files are untouched.'),
            },
          ]}
        />
      </View>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Tap outside, use the back button, or choose an action to close.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, paddingTop: 48, gap: 22 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: '600', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 23 },
  card: { borderWidth: 1, borderRadius: 24, padding: 24, gap: 18 },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 18,
  },
  footer: { fontSize: 11, lineHeight: 18 },
});
