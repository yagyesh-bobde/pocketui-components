import { useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from './theme';

export interface PromptInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop?: () => void;
  status?: 'ready' | 'submitting' | 'streaming' | 'error';
  disabled?: boolean;
  placeholder?: string;
  accessibilityLabel?: string;
  maxLength?: number;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Controlled multiline composer. Submit emits trimmed text; the host decides when to clear it. */
export function PromptInput({
  value,
  onValueChange,
  onSubmit,
  onStop,
  status = 'ready',
  disabled = false,
  placeholder = 'Ask anything…',
  accessibilityLabel = 'Message',
  maxLength,
  hint,
  style,
  testID,
}: PromptInputProps) {
  const { colors } = useTheme();
  const [height, setHeight] = useState(48);
  const busy = status === 'submitting' || status === 'streaming';
  const blocked = disabled || (busy ? !onStop : value.trim().length === 0);
  const limit =
    maxLength !== undefined && Number.isFinite(maxLength)
      ? Math.max(1, Math.floor(maxLength))
      : undefined;
  return (
    <View
      testID={testID}
      style={[
        styles.root,
        {
          backgroundColor: colors.card,
          borderColor: status === 'error' ? colors.danger : colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <TextInput
        testID={testID ? `${testID}-input` : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Write a message, then choose Send. Return adds a new line."
        accessibilityState={{ disabled }}
        value={value}
        onChangeText={onValueChange}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline
        submitBehavior="newline"
        maxLength={limit}
        onContentSizeChange={(event) =>
          setHeight(Math.max(48, Math.min(140, event.nativeEvent.contentSize.height)))
        }
        style={[styles.input, { height, color: colors.foreground }]}
      />
      <View style={styles.footer}>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint ?? (busy ? 'Response in progress' : 'Return for a new line')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            busy ? (onStop ? 'Stop response' : 'Response in progress') : 'Send message'
          }
          accessibilityState={{ disabled: blocked, busy }}
          disabled={blocked}
          testID={testID ? `${testID}-${busy ? 'stop' : 'submit'}` : undefined}
          onPress={() => {
            if (blocked) return;
            if (busy) onStop?.();
            else onSubmit(value.trim());
          }}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: colors.primary, opacity: blocked ? 0.35 : pressed ? 0.7 : 1 },
          ]}
        >
          <Text
            accessible={false}
            style={{ color: colors.primaryForeground, fontSize: busy ? 13 : 20 }}
          >
            {busy ? '■' : '↑'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: 1, borderRadius: 20, padding: 12, gap: 10 },
  input: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 4,
    paddingVertical: 6,
    textAlignVertical: 'top',
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  hint: { flex: 1, fontSize: 10, lineHeight: 16 },
  send: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
