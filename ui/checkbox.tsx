import { useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { theme, useTheme } from './theme';

const SIZE = 20;

export interface CheckboxProps {
  /** Controlled when passed. */
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Square toggle with a check drawn from borders, so it needs no icon library. */
export function Checkbox({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: CheckboxProps) {
  const { colors } = useTheme();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const checked = value ?? uncontrolled;

  const toggle = () => {
    const next = !checked;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={theme.spacing.md}
      onPress={toggle}
      testID={testID}
      style={({ pressed }) => [
        styles.box,
        { borderColor: colors.primary },
        checked && { backgroundColor: colors.primary },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {checked ? <View style={[styles.check, { borderColor: colors.primaryForeground }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  check: {
    width: 6,
    height: 11,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});
