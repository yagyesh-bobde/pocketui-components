import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RadioGroup, RadioGroupItem } from '../ui/radio';
import { theme, useTheme } from '../ui/theme';

export default function RadioDemo() {
  const { colors } = useTheme();
  const [delivery, setDelivery] = useState('standard');
  return (
    <View style={styles.screen}>
      <Text style={[styles.heading, { color: colors.foreground }]}>One good choice.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Choose a delivery option. Tap anywhere on a row.
      </Text>
      <RadioGroup
        value={delivery}
        onValueChange={setDelivery}
        accessibilityLabel="Delivery method"
        testID="radio-delivery"
      >
        <RadioGroupItem
          value="standard"
          label="Standard delivery"
          description="3–5 business days · Free"
          testID="radio-standard"
        />
        <RadioGroupItem
          value="express"
          label="Express delivery"
          description="1–2 business days · $8"
          testID="radio-express"
        />
        <RadioGroupItem
          value="same-day"
          label="Same-day delivery"
          description="Not available at your address"
          disabled
          testID="radio-disabled"
        />
      </RadioGroup>
      <Text accessibilityLiveRegion="polite" style={[styles.result, { color: colors.foreground }]}>
        {delivery === 'standard' ? 'Standard delivery · Free' : 'Express delivery · $8'}
      </Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Uncontrolled group with a starting value
      </Text>
      <RadioGroup defaultValue="weekly" accessibilityLabel="Update frequency">
        <RadioGroupItem
          value="weekly"
          label="Weekly digest"
          description="The good stuff, once a week."
        />
        <RadioGroupItem
          value="monthly"
          label="Monthly roundup"
          description="A little less, a little less often."
        />
      </RadioGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, gap: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: theme.fontWeight.semibold, letterSpacing: -0.8 },
  copy: { fontSize: theme.fontSize.sm, lineHeight: 22 },
  result: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.md,
  },
});
