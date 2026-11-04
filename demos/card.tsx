import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { theme, useTheme } from '../ui/theme';

export default function CardDemo() {
  const { colors } = useTheme();
  const [plan, setPlan] = useState('Personal');
  const [saved, setSaved] = useState(false);
  return (
    <View style={styles.screen}>
      <Text style={[styles.heading, { color: colors.foreground }]}>A little structure.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Group related content. Give the next step a clear place.
      </Text>
      <Card>
        <CardHeader>
          <CardTitle>Field notes</CardTitle>
          <CardDescription>A home for the ideas you want to keep.</CardDescription>
          <CardAction>
            <Text style={[styles.tag, { color: colors.success }]}>PERSONAL WORKSPACE</Text>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Text style={[styles.copy, { color: colors.foreground }]}>
            12 notes · Updated just now
          </Text>
        </CardContent>
        <CardFooter>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>
            {saved ? 'Saved to your library' : 'Ready when inspiration strikes'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSaved((current) => !current)}
            testID="card-save"
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={{ color: colors.primaryForeground }}>{saved ? 'Unsave' : 'Save'}</Text>
          </Pressable>
        </CardFooter>
      </Card>
      <Text style={[styles.subheading, { color: colors.foreground }]}>Choose your workspace</Text>
      {['Personal', 'Team'].map((label) => (
        <Card
          key={label}
          variant="filled"
          onPress={() => setPlan(label)}
          selected={plan === label}
          accessibilityLabel={`${label} workspace`}
          testID={`card-${label.toLowerCase()}`}
        >
          <CardHeader>
            <CardTitle>
              {label}
              {plan === label ? ' ✓' : ''}
            </CardTitle>
            <CardDescription>
              {label === 'Personal'
                ? 'A space to make something your own.'
                : 'Make room for a few more good ideas.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.copy, { color: colors.mutedForeground }]}
      >
        {plan} workspace selected
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, gap: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: theme.fontWeight.semibold, letterSpacing: -0.8 },
  subheading: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  copy: { fontSize: theme.fontSize.sm, lineHeight: 22 },
  tag: { fontSize: 10, fontWeight: theme.fontWeight.semibold, letterSpacing: 1 },
  button: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
