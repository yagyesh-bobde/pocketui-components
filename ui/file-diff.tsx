import {
  Platform,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { type DiffLine, diffCounts } from './ai-tool-utils';
import { useTheme } from './theme';

export type { DiffLine } from './ai-tool-utils';
export interface FileDiffProps {
  filename: string;
  lines: readonly DiffLine[];
  oldStart?: number;
  newStart?: number;
  lineNumbers?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Review a host-supplied diff. Added/removed counts describe these displayed lines only. */
export function FileDiff({
  filename,
  lines,
  oldStart = 1,
  newStart = 1,
  lineNumbers = true,
  style,
  testID,
}: FileDiffProps) {
  const { colors } = useTheme();
  const counts = diffCounts(lines);
  let oldLine = Number.isFinite(oldStart) ? Math.max(1, Math.trunc(oldStart)) : 1;
  let newLine = Number.isFinite(newStart) ? Math.max(1, Math.trunc(newStart)) : 1;
  const rows = lines.map((line) => {
    const row = {
      ...line,
      oldLine: line.type === 'added' ? null : oldLine,
      newLine: line.type === 'removed' ? null : newLine,
      key: `${oldLine}:${newLine}:${line.type}`,
    };
    if (line.type !== 'added') oldLine += 1;
    if (line.type !== 'removed') newLine += 1;
    return row;
  });
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.filename, { color: colors.foreground }]}>{filename}</Text>
        <View
          accessible
          accessibilityLabel={`${counts.added} added, ${counts.removed} removed`}
          style={styles.counts}
        >
          <Text style={{ color: colors.success, fontSize: 11 }}>+{counts.added}</Text>
          <Text style={{ color: colors.danger, fontSize: 11 }}>−{counts.removed}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.lines}>
          {rows.map((line) => (
            <View
              key={line.key}
              style={[
                styles.line,
                {
                  backgroundColor:
                    line.type === 'added'
                      ? colors.successSurface
                      : line.type === 'removed'
                        ? colors.muted
                        : colors.card,
                },
              ]}
            >
              {lineNumbers && (
                <>
                  <Text
                    accessible={false}
                    style={[styles.code, styles.number, { color: colors.mutedForeground }]}
                  >
                    {line.oldLine ?? ''}
                  </Text>
                  <Text
                    accessible={false}
                    style={[styles.code, styles.number, { color: colors.mutedForeground }]}
                  >
                    {line.newLine ?? ''}
                  </Text>
                </>
              )}
              <Text
                accessibilityLabel={
                  line.type === 'added'
                    ? 'Added'
                    : line.type === 'removed'
                      ? 'Removed'
                      : 'Unchanged'
                }
                style={[
                  styles.code,
                  styles.prefix,
                  {
                    color:
                      line.type === 'added'
                        ? colors.success
                        : line.type === 'removed'
                          ? colors.danger
                          : colors.mutedForeground,
                  },
                ]}
              >
                {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
              </Text>
              <Text selectable style={[styles.code, styles.text, { color: colors.foreground }]}>
                {line.text || ' '}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filename: { flex: 1, fontSize: 12, fontWeight: '500' },
  counts: { flexDirection: 'row', gap: 10 },
  lines: { minWidth: 320, paddingVertical: 10 },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 11,
    lineHeight: 20,
  },
  number: { width: 28, textAlign: 'right', marginRight: 8 },
  prefix: { width: 16 },
  text: { paddingRight: 16 },
});
