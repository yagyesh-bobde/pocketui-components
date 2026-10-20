import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/button';
import { theme, useTheme } from '../ui/theme';

export default function ButtonDemo() {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const heading = [styles.heading, { color: colors.mutedForeground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Variants</Text>
      <View style={styles.row}>
        <Button testID="button-default">Default</Button>
        <Button variant="secondary" testID="button-secondary">
          Secondary
        </Button>
        <Button variant="outline" testID="button-outline">
          Outline
        </Button>
        <Button variant="ghost" testID="button-ghost">
          Ghost
        </Button>
      </View>

      <Text style={heading}>Sizes</Text>
      <View style={styles.row}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </View>

      <Text style={heading}>Disabled</Text>
      <View style={styles.row}>
        <Button disabled testID="button-disabled">
          Disabled
        </Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </View>

      <Text style={heading}>Interactive</Text>
      <Button testID="button-counter" onPress={() => setCount((c) => c + 1)}>
        {`Pressed ${count} ${count === 1 ? 'time' : 'times'}`}
      </Button>
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
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
