import { createContext, type ReactNode, use, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { theme, useTheme } from './theme';

export interface TabsProps {
  /** Controlled when passed. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

interface TabsContextValue {
  value: string | undefined;
  select: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const value = use(TabsContext);
  if (value === null) throw new Error(`<${component}> must be used within <Tabs>`);
  return value;
}

/** Segmented-control tabs: one `TabsContent` shows at a time, chosen by its `TabsTrigger`. */
export function Tabs({ value, defaultValue, onValueChange, style, children }: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = value ?? uncontrolled;

  const select = (next: string) => {
    if (next === selected) return;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext value={{ value: selected, select }}>
      <View style={[styles.tabs, style]}>{children}</View>
    </TabsContext>
  );
}

export interface TabsListProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function TabsList({ style, children }: TabsListProps) {
  useTabsContext('TabsList');
  const { colors, scheme } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.list,
        // The selected trigger must be the brighter surface: in dark, muted on card.
        {
          backgroundColor: scheme === 'dark' ? colors.card : colors.muted,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: ReactNode;
}

export function TabsTrigger({
  value,
  disabled = false,
  style,
  testID,
  children,
}: TabsTriggerProps) {
  const { value: selectedValue, select } = useTabsContext('TabsTrigger');
  const { colors, scheme } = useTheme();
  const selected = value === selectedValue;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => select(value)}
      testID={testID}
      style={({ pressed }) => [
        styles.trigger,
        selected && { backgroundColor: scheme === 'dark' ? colors.muted : colors.background },
        pressed && !selected && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            { color: selected ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export interface TabsContentProps {
  value: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: ReactNode;
}

export function TabsContent({ value, style, testID, children }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext('TabsContent');
  const { colors } = useTheme();

  if (value !== selectedValue) return null;

  return (
    <View testID={testID} style={style}>
      {typeof children === 'string' ? (
        <Text style={[styles.contentText, { color: colors.foreground }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    gap: theme.spacing.md,
  },
  list: {
    flexDirection: 'row',
    padding: theme.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.lg,
  },
  trigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  contentText: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
