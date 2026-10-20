import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from '../ui/input';
import { theme, useTheme } from '../ui/theme';

export default function InputDemo() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const heading = [styles.heading, { color: colors.mutedForeground }];
  const label = [styles.label, { color: colors.foreground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Default</Text>
      <Input
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        testID="input-email"
      />

      <Text style={heading}>With label</Text>
      <View style={styles.field}>
        <Text style={label}>Name</Text>
        <Input placeholder="Ada Lovelace" value={name} onChangeText={setName} testID="input-name" />
        <Text style={[styles.hint, { color: colors.mutedForeground }]} testID="input-name-echo">
          {name ? `Hello, ${name}` : 'Type your name'}
        </Text>
      </View>

      <Text style={heading}>Password</Text>
      <Input placeholder="Password" secureTextEntry testID="input-password" />

      <Text style={heading}>Disabled</Text>
      <Input placeholder="Read only" editable={false} />
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
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  hint: {
    fontSize: theme.fontSize.sm,
  },
});
