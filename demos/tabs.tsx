import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { theme, useTheme } from '../ui/theme';

export default function TabsDemo() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState('week');
  const heading = [styles.heading, { color: colors.mutedForeground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Uncontrolled</Text>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account" testID="tabs-trigger-account">
            Account
          </TabsTrigger>
          <TabsTrigger value="password" testID="tabs-trigger-password">
            Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" testID="tabs-content-account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password" testID="tabs-content-password">
          Change your password here.
        </TabsContent>
      </Tabs>

      <Text style={heading}>Controlled</Text>
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <Text style={[styles.hint, { color: colors.mutedForeground }]} testID="tabs-period-state">
          {`Showing this ${period}`}
        </Text>
      </Tabs>

      <Text style={heading}>Disabled trigger</Text>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing" disabled>
            Billing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Billing is unavailable on this plan.</TabsContent>
      </Tabs>
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
  hint: {
    fontSize: theme.fontSize.sm,
  },
});
