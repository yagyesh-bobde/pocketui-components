import { useState } from 'react';
import { Text, View } from 'react-native';
import { ContextMenu } from '../ui/context-menu';
import { useTheme } from '../ui/theme';
import { DemoButton, demoStyles, EssentialsDemo } from './essentials-demo';
export default function ContextMenuDemo() {
  const { colors } = useTheme();
  const [status, setStatus] = useState('A few useful things, right where you are.');
  return (
    <EssentialsDemo
      title="Context Menu"
      description="The right actions, close at hand. Tap or hold a card to reveal a menu that stays within reach."
    >
      <ContextMenu
        testID="note-menu"
        accessibilityLabel="Actions for Field notes"
        items={[
          { key: 'share', label: 'Share note', onSelect: () => setStatus('Share note selected.') },
          {
            key: 'duplicate',
            label: 'Duplicate',
            onSelect: () => setStatus('A fresh copy is ready.'),
          },
          {
            key: 'move',
            label: 'Move to folder',
            onSelect: () => setStatus('Move to folder selected.'),
          },
          { key: 'offline', label: 'Available offline', disabled: true, onSelect: () => {} },
          {
            key: 'delete',
            label: 'Delete note',
            destructive: true,
            onSelect: () => setStatus('Note deleted. Your other notes are safe.'),
          },
        ]}
        trigger={
          <View
            style={[
              demoStyles.card,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                minHeight: 230,
                justifyContent: 'space-between',
              },
            ]}
          >
            <View style={demoStyles.row}>
              <Text style={{ color: colors.mint, fontSize: 24 }}>✦</Text>
              <Text style={{ marginLeft: 'auto', color: colors.mutedForeground, fontSize: 24 }}>
                ···
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={[demoStyles.title, { color: colors.foreground }]}>Field notes</Text>
              <Text style={[demoStyles.text, { color: colors.mutedForeground }]}>
                Collect the little things you want to remember.
              </Text>
            </View>
            <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
              Tap or long-press for actions ↗
            </Text>
          </View>
        }
      />
      <Text testID="menu-status" style={[demoStyles.text, { color: colors.mutedForeground }]}>
        {status}
      </Text>
      <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
        Anchored placement. Safe edges. Disabled and destructive actions.
      </Text>
      <DemoButton
        testID="menu-reset"
        secondary
        onPress={() => setStatus('A few useful things, right where you are.')}
      >
        Reset example
      </DemoButton>
    </EssentialsDemo>
  );
}
