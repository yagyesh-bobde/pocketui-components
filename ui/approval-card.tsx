import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme';
import { ToolApproval, type ToolApprovalProps } from './tool-approval';

export interface ApprovalDetail {
  label: string;
  value: string;
}
export interface ApprovalCardProps extends Omit<ToolApprovalProps, 'title' | 'children'> {
  action: string;
  details: readonly ApprovalDetail[];
}

/** Show the proposed action and its exact details before the user approves or declines. */
export function ApprovalCard({ action, details, ...props }: ApprovalCardProps) {
  const { colors } = useTheme();
  return (
    <ToolApproval {...props} title={action}>
      <View style={[styles.details, { backgroundColor: colors.muted }]}>
        {details.map((detail) => (
          <View key={detail.label} style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{detail.label}</Text>
            <Text selectable style={[styles.value, { color: colors.foreground }]}>
              {detail.value}
            </Text>
          </View>
        ))}
      </View>
    </ToolApproval>
  );
}

const styles = StyleSheet.create({
  details: { padding: 14, gap: 12, borderRadius: 12 },
  row: { gap: 4 },
  label: { fontSize: 10, fontWeight: '500' },
  value: { fontSize: 12, lineHeight: 19 },
});
