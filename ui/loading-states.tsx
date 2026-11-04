import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Loader } from './loader';
import { useTheme } from './theme';

export type LoadingPhase = 'thinking' | 'searching' | 'writing';
export interface LoadingStatesProps {
  phase?: LoadingPhase;
  label?: string;
  detail?: string;
  compact?: boolean;
  active?: boolean;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Host-supplied activity with one loading announcement and an optional cancel action. */
export function LoadingStates({
  phase = 'thinking',
  label,
  detail,
  compact = false,
  active = true,
  onCancel,
  style,
  testID,
}: LoadingStatesProps) {
  const { colors } = useTheme();
  if (!active) return null;
  const title =
    label ??
    (phase === 'thinking'
      ? 'Thinking it through'
      : phase === 'searching'
        ? 'Looking for context'
        : 'Putting it into words');
  return (
    <View
      testID={testID}
      style={[
        styles.root,
        !compact && [styles.card, { backgroundColor: colors.muted, borderColor: colors.border }],
        style,
      ]}
    >
      <View
        accessible
        accessibilityLabel={detail ? `${title}. ${detail}` : title}
        accessibilityState={{ busy: true }}
        accessibilityLiveRegion="polite"
        style={styles.status}
      >
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Loader
            variant={phase === 'thinking' ? 'dots' : 'spinner'}
            size={compact ? 18 : 24}
            color={colors.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {detail && (
            <Text style={[styles.detail, { color: colors.mutedForeground }]}>{detail}</Text>
          )}
        </View>
      </View>
      {onCancel && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cancel ${title}`}
          onPress={onCancel}
          style={styles.cancel}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: { padding: 18, borderWidth: 1, borderRadius: 18 },
  status: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  title: { fontSize: 13, fontWeight: '500', lineHeight: 20 },
  detail: { fontSize: 11, lineHeight: 18 },
  cancel: { minHeight: 44, paddingHorizontal: 6, justifyContent: 'center' },
});
