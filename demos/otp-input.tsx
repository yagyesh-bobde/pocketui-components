import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { OTPInput } from '../ui/otp-input';
import { theme, useTheme } from '../ui/theme';

export default function OTPInputDemo() {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [length, setLength] = useState(6);
  const [status, setStatus] = useState<'default' | 'error' | 'success'>('default');
  const expected = length === 6 ? '246810' : '2468';
  const ready = code.length === length;
  return (
    <View style={styles.screen}>
      <Text style={[styles.heading, { color: colors.foreground }]}>A quick check.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Enter the demo code {expected}. Type it, paste it, or use SMS autofill in your app.
      </Text>
      <OTPInput
        value={code}
        length={length}
        onValueChange={(next) => {
          setCode(next);
          setStatus('default');
        }}
        status={status}
        accessibilityLabel="Demo verification code"
        testID="otp-code"
        editable={status !== 'success'}
      />
      <Text
        accessibilityLiveRegion="polite"
        style={[
          styles.copy,
          {
            color:
              status === 'error'
                ? colors.danger
                : status === 'success'
                  ? colors.success
                  : colors.mutedForeground,
          },
        ]}
      >
        {status === 'success'
          ? 'Demo code accepted. No request was sent.'
          : status === 'error'
            ? 'That code doesn’t match. Edit it and try again.'
            : ready
              ? 'Code complete. Choose Verify to continue.'
              : `${code.length} of ${length} digits entered`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready || status === 'success' }}
        disabled={!ready || status === 'success'}
        onPress={() => {
          Keyboard.dismiss();
          setStatus(code === expected ? 'success' : 'error');
        }}
        testID="otp-verify"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: !ready || status === 'success' ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.primaryForeground }}>Verify demo code</Text>
      </Pressable>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setCode('');
            setStatus('default');
          }}
          testID="otp-reset"
          style={[styles.secondary, { backgroundColor: colors.muted }]}
        >
          <Text style={{ color: colors.foreground }}>Reset</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setLength(length === 6 ? 4 : 6);
            setCode('');
            setStatus('default');
          }}
          testID="otp-length"
          style={[styles.secondary, { backgroundColor: colors.muted }]}
        >
          <Text style={{ color: colors.foreground }}>Use {length === 6 ? 4 : 6} digits</Text>
        </Pressable>
      </View>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        One native input keeps paste, deletion and autofill together. Completion never submits a
        code for you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: theme.spacing.xl, gap: theme.spacing.xl },
  heading: { fontSize: 28, fontWeight: theme.fontWeight.semibold, letterSpacing: -0.8 },
  copy: { fontSize: theme.fontSize.sm, lineHeight: 22 },
  button: {
    minHeight: 48,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  secondary: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
});
