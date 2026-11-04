import { type ComponentRef, type Ref, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from 'react-native';
import { otpDigits, otpLength } from './otp-input-state';
import { theme, useTheme } from './theme';

export interface OTPInputProps
  extends Omit<
    TextInputProps,
    'value' | 'defaultValue' | 'onChangeText' | 'style' | 'maxLength' | 'multiline' | 'children'
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Reports a newly completed code. The host still decides when and how to verify it. */
  onComplete?: (value: string) => void;
  length?: number;
  status?: 'default' | 'error' | 'success';
  style?: ViewProps['style'];
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/** One real input for selection, paste and SMS autofill; visual slots are decorative. */
export function OTPInput({
  value,
  defaultValue = '',
  onValueChange,
  onComplete,
  length = 6,
  status = 'default',
  editable = true,
  secureTextEntry = false,
  accessibilityLabel = 'Verification code',
  style,
  onFocus,
  onBlur,
  ref,
  ...props
}: OTPInputProps) {
  const { colors } = useTheme();
  const count = otpLength(length);
  const [internal, setInternal] = useState(() => otpDigits(defaultValue, count));
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const lastCompleted = useRef<string | null>(null);
  const code = otpDigits(value ?? internal, count);
  useEffect(() => {
    if (code.length < count) lastCompleted.current = null;
  }, [code, count]);
  const accent =
    status === 'error' ? colors.danger : status === 'success' ? colors.success : colors.primary;
  const change = (text: string) => {
    if (!editable) return;
    const next = otpDigits(text, count);
    if (value === undefined) setInternal(next);
    if (next === code) return;
    onValueChange?.(next);
    if (next.length < count) lastCompleted.current = null;
    else if (lastCompleted.current !== next) {
      lastCompleted.current = next;
      onComplete?.(next);
    }
  };
  return (
    <View style={[styles.root, !editable && styles.disabled, style]}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.slots}
      >
        {Array.from({ length: count }, (_, index) => {
          const active = focused && index === Math.min(cursor ?? code.length, count - 1);
          return (
            <View
              key={index.toString()}
              style={[
                styles.slot,
                {
                  backgroundColor: colors.card,
                  borderColor: status !== 'default' || active ? accent : colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.digit, { color: colors.foreground }]}>
                {code[index] ? (secureTextEntry ? '•' : code[index]) : active ? '│' : ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        importantForAutofill="yes"
        autoCorrect={false}
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        caretHidden
        contextMenuHidden={false}
        {...props}
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={
          props.accessibilityHint ?? `Enter the ${count}-digit code. You can also paste it.`
        }
        accessibilityState={{ ...props.accessibilityState, disabled: !editable }}
        editable={editable}
        secureTextEntry={secureTextEntry}
        value={code}
        onChangeText={change}
        onSelectionChange={(event) => {
          setCursor(event.nativeEvent.selection.start);
          props.onSelectionChange?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: 52, position: 'relative' },
  slots: { flexDirection: 'row', gap: theme.spacing.xs },
  slot: {
    minWidth: 0,
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  digit: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: theme.fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  input: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 22,
    padding: 0,
  },
  disabled: { opacity: 0.5 },
});
