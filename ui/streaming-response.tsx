import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from './theme';

export type StreamingStatus = 'idle' | 'streaming' | 'complete' | 'error' | 'stopped';
export interface StreamingResponseProps {
  text: string;
  status?: StreamingStatus;
  errorMessage?: string;
  onRetry?: () => void;
  selectable?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Renders text supplied incrementally by the host. No network or simulated typing inside. */
export function StreamingResponse({
  text,
  status = 'complete',
  errorMessage = 'The response could not be completed.',
  onRetry,
  selectable = true,
  style,
  testID,
}: StreamingResponseProps) {
  const { colors } = useTheme();
  const label =
    status === 'streaming'
      ? 'Responding'
      : status === 'complete'
        ? 'Complete'
        : status === 'error'
          ? 'Response interrupted'
          : status === 'stopped'
            ? 'Stopped'
            : 'Ready';
  return (
    <View testID={testID} style={[styles.root, style]}>
      <Text
        selectable={selectable}
        accessibilityLiveRegion="none"
        style={[styles.text, { color: colors.foreground }]}
      >
        {text ||
          (status === 'streaming'
            ? 'Thinking…'
            : status === 'idle'
              ? 'Waiting for a response.'
              : '')}
        {status === 'streaming' && text ? (
          <Text accessibilityElementsHidden style={{ color: colors.primary }}>
            {' '}
            ▍
          </Text>
        ) : null}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        accessibilityState={{ busy: status === 'streaming' }}
        style={[styles.status, { color: colors.mutedForeground }]}
      >
        {label}
      </Text>
      {status === 'error' && (
        <View style={styles.error}>
          <Text accessibilityRole="alert" style={[styles.status, { color: colors.danger }]}>
            {errorMessage}
          </Text>
          {onRetry && (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={[styles.retry, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.foreground, fontSize: 12 }}>Try again</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  text: { fontSize: 15, lineHeight: 25 },
  status: { fontSize: 11, lineHeight: 18 },
  error: { gap: 8 },
  retry: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
});
