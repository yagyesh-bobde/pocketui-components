import { createContext, type ReactNode, use, useEffect, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme, useTheme } from './theme';

interface RadioContextValue {
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  testID?: string;
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  style,
  children,
  testID,
}: RadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const select = (next: string) => {
    if (disabled || next === selected) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <RadioContext value={{ value: selected, disabled, select }}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[styles.group, style]}
      >
        {children}
      </View>
    </RadioContext>
  );
}

export interface RadioGroupItemProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A full-row touch target; the dot and labels are one accessible radio control. */
export function RadioGroupItem({
  value,
  label,
  description,
  disabled = false,
  style,
  testID,
}: RadioGroupItemProps) {
  const context = use(RadioContext);
  if (!context) throw new Error('RadioGroupItem must be inside RadioGroup');
  const { colors } = useTheme();
  const checked = context.value === value;
  const unavailable = context.disabled || disabled;
  const scale = useSharedValue(checked ? 1 : 0);
  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, {
      damping: 18,
      stiffness: 240,
      reduceMotion: ReduceMotion.System,
    });
  }, [checked, scale]);
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));
  return (
    <Pressable
      accessible
      accessibilityRole="radio"
      accessibilityLabel={description ? `${label}. ${description}` : label}
      accessibilityState={{ checked, disabled: unavailable }}
      disabled={unavailable}
      onPress={() => context.select(value)}
      testID={testID}
      style={({ pressed }) => [
        styles.item,
        { borderColor: checked ? colors.primary : colors.border, backgroundColor: colors.card },
        (pressed || unavailable) && styles.dim,
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.ring, { borderColor: checked ? colors.primary : colors.mutedForeground }]}
      >
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dotStyle]} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: theme.spacing.sm },
  item: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
  },
  ring: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  label: { fontSize: theme.fontSize.sm, lineHeight: 21, fontWeight: theme.fontWeight.medium },
  description: { fontSize: 12, lineHeight: 18 },
  dim: { opacity: 0.5 },
});
