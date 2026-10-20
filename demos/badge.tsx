import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/badge';
import { theme, useTheme } from '../ui/theme';

export default function BadgeDemo() {
  const { colors } = useTheme();
  const heading = [styles.heading, { color: colors.mutedForeground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Variants</Text>
      <View style={styles.row}>
        <Badge testID="badge-default">Default</Badge>
        <Badge variant="secondary" testID="badge-secondary">
          Secondary
        </Badge>
        <Badge variant="outline" testID="badge-outline">
          Outline
        </Badge>
      </View>

      <Text style={heading}>In context</Text>
      <View style={styles.inline}>
        <Text style={[styles.label, { color: colors.foreground }]}>Inbox</Text>
        <Badge>12</Badge>
      </View>
      <View style={styles.inline}>
        <Text style={[styles.label, { color: colors.foreground }]}>Release 1.4</Text>
        <Badge variant="outline">Beta</Badge>
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
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
  },
});
