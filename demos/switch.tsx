import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Switch } from '../ui/switch';
import { theme, useTheme } from '../ui/theme';

export default function SwitchDemo() {
  const { colors } = useTheme();
  const [wifi, setWifi] = useState(true);
  const heading = [styles.heading, { color: colors.mutedForeground }];
  const label = [styles.label, { color: colors.foreground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Uncontrolled</Text>
      <View style={styles.row}>
        <Text style={label}>Airplane mode</Text>
        <Switch accessibilityLabel="Airplane mode" testID="switch-airplane" />
      </View>
      <View style={styles.row}>
        <Text style={label}>Notifications</Text>
        <Switch accessibilityLabel="Notifications" defaultValue testID="switch-notifications" />
      </View>

      <Text style={heading}>Controlled</Text>
      <View style={styles.row}>
        <Text style={label}>Wi-Fi</Text>
        <Switch
          accessibilityLabel="Wi-Fi"
          value={wifi}
          onValueChange={setWifi}
          testID="switch-wifi"
        />
      </View>
      <Text style={[styles.hint, { color: colors.mutedForeground }]} testID="switch-wifi-state">
        {`Wi-Fi is ${wifi ? 'on' : 'off'}`}
      </Text>

      <Text style={heading}>Disabled</Text>
      <View style={styles.row}>
        <Text style={label}>Locked off</Text>
        <Switch accessibilityLabel="Locked off" disabled />
      </View>
      <View style={styles.row}>
        <Text style={label}>Locked on</Text>
        <Switch accessibilityLabel="Locked on" defaultValue disabled />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.md,
  },
  hint: {
    fontSize: theme.fontSize.sm,
  },
});
