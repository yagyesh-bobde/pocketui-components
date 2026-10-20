import { type ComponentRef, type Ref, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { theme, useTheme } from './theme';

export interface InputProps extends TextInputProps {
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/** Themed single-line `TextInput`. Every `TextInput` prop is forwarded. */
export function Input({ style, editable = true, onFocus, onBlur, ...props }: InputProps) {
  const { colors, scheme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      editable={editable}
      placeholderTextColor={colors.mutedForeground}
      selectionColor={colors.foreground}
      cursorColor={colors.foreground}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      {...props}
      style={[
        styles.input,
        {
          color: colors.foreground,
          // Light: white field on a gray border. Dark: muted fill, since muted === border.
          backgroundColor: scheme === 'dark' ? colors.muted : colors.background,
          borderColor: focused ? colors.mutedForeground : colors.border,
        },
        !editable && styles.disabled,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 0,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    fontSize: theme.fontSize.md,
  },
  disabled: {
    opacity: 0.5,
  },
});
