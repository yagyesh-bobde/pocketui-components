import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '../ui/checkbox';
import { theme, useTheme } from '../ui/theme';

export default function CheckboxDemo() {
  const { colors } = useTheme();
  const [terms, setTerms] = useState(false);
  const heading = [styles.heading, { color: colors.mutedForeground }];
  const label = [styles.label, { color: colors.foreground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Uncontrolled</Text>
      <View style={styles.row}>
        <Checkbox accessibilityLabel="Email updates" defaultValue testID="checkbox-email" />
        <Text style={label}>Email updates</Text>
      </View>
      <View style={styles.row}>
        <Checkbox accessibilityLabel="Product news" testID="checkbox-news" />
        <Text style={label}>Product news</Text>
      </View>

      <Text style={heading}>Controlled</Text>
      <View style={styles.row}>
        <Checkbox
          accessibilityLabel="Accept terms and conditions"
          value={terms}
          onValueChange={setTerms}
          testID="checkbox-terms"
        />
        <Text style={label}>Accept terms and conditions</Text>
      </View>
      <Text style={[styles.hint, { color: colors.mutedForeground }]} testID="checkbox-terms-state">
        {terms ? 'Terms accepted' : 'Terms not accepted'}
      </Text>

      <Text style={heading}>Disabled</Text>
      <View style={styles.row}>
        <Checkbox accessibilityLabel="Locked" defaultValue disabled />
        <Text style={label}>Locked</Text>
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
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.md,
  },
  hint: {
    fontSize: theme.fontSize.sm,
  },
});
