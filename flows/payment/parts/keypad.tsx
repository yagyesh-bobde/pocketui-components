import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import { PaymentIcon } from './icons';

export function Keypad({
  decimal = false,
  onKey,
}: {
  decimal?: boolean;
  onKey: (key: string) => void;
}) {
  const { colors, fontSize, fontWeight } = useTheme();
  return (
    <View style={styles.grid}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', decimal ? '.' : '', '0', 'delete'].map(
        (key) =>
          key ? (
            <Pressable
              key={key}
              testID={
                key === 'delete'
                  ? 'payment-backspace'
                  : key === '.'
                    ? 'payment-decimal'
                    : `payment-key-${key}`
              }
              accessibilityRole="button"
              accessibilityLabel={
                key === 'delete' ? 'Backspace' : key === '.' ? 'Decimal point' : key
              }
              onPress={() => onKey(key)}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: pressed ? colors.muted : undefined },
              ]}
            >
              {key === 'delete' ? (
                <PaymentIcon kind="delete" color={colors.foreground} />
              ) : (
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: fontSize.heading,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  {key}
                </Text>
              )}
            </Pressable>
          ) : (
            <View key="empty" style={styles.key} />
          ),
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  key: {
    width: '33.333%',
    minHeight: 56,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
});
