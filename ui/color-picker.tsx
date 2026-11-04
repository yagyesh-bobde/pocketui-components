import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from './theme';

const DEFAULT_PALETTE = [
  '#047857',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#F59E0B',
  '#18181B',
  '#FFFFFF',
];

/** Accepts three or six hexadecimal digits, with an optional leading #. */
export function normalizeHexColor(value: string): string | undefined {
  const hex = value.trim().replace(/^#/, '');
  if (!/^(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) return undefined;
  return `#${(hex.length === 3 ? [...hex].map((character) => character.repeat(2)).join('') : hex).toUpperCase()}`;
}

function foreground(hex: string): string {
  const channels = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    (channels[0] ?? 0) * 0.2126 + (channels[1] ?? 0) * 0.7152 + (channels[2] ?? 0) * 0.0722;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#FFFFFF';
}

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  palette?: readonly string[];
  label?: string;
  disabled?: boolean;
  testID?: string;
}

/** A palette picker with explicit custom hex entry. It does not include an HSV canvas or alpha. */
export function ColorPicker({
  value,
  defaultValue = '#047857',
  onValueChange,
  palette = DEFAULT_PALETTE,
  label = 'Color',
  disabled = false,
  testID,
}: ColorPickerProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState(defaultValue);
  const selected = normalizeHexColor(value ?? local);
  if (!selected) throw new Error('ColorPicker value must be a three- or six-digit hex color.');
  const [draft, setDraft] = useState(selected);
  const [error, setError] = useState(false);
  useEffect(() => {
    setDraft(selected);
    setError(false);
  }, [selected]);
  const swatches = [
    ...new Set(
      palette.flatMap((entry) => {
        const normalized = normalizeHexColor(entry);
        return normalized ? [normalized] : [];
      }),
    ),
  ];
  const commit = (next: string) => {
    if (disabled) return;
    const normalized = normalizeHexColor(next);
    if (!normalized) {
      setError(true);
      return;
    }
    setDraft(normalized);
    setError(false);
    if (value === undefined) setLocal(normalized);
    if (normalized !== selected) onValueChange?.(normalized);
  };
  return (
    <View testID={testID} style={[styles.root, { opacity: disabled ? 0.45 : 1 }]}>
      <View style={styles.heading}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.hex, { color: colors.mutedForeground }]}>{selected}</Text>
      </View>
      <View
        accessible
        accessibilityLabel={`Selected color ${selected}`}
        style={[styles.preview, { backgroundColor: selected, borderColor: colors.border }]}
      >
        <Text accessible={false} style={[styles.previewText, { color: foreground(selected) }]}>
          Make it yours.
        </Text>
      </View>
      <View style={styles.swatches}>
        {swatches.map((swatch) => (
          <Pressable
            key={swatch}
            accessibilityRole="radio"
            accessibilityLabel={swatch}
            accessibilityState={{ checked: swatch === selected, disabled }}
            disabled={disabled}
            onPress={() => commit(swatch)}
            style={({ pressed }) => [
              styles.swatch,
              {
                backgroundColor: swatch,
                borderColor: swatch === selected ? colors.foreground : colors.border,
                borderWidth: swatch === selected ? 3 : 1,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {swatch === selected && (
              <Text
                accessible={false}
                style={{ color: foreground(swatch), fontSize: 18, fontWeight: '600' }}
              >
                ✓
              </Text>
            )}
          </Pressable>
        ))}
      </View>
      <Text style={[styles.inputLabel, { color: colors.foreground }]}>Custom hex</Text>
      <View style={styles.custom}>
        <TextInput
          accessibilityLabel={`${label} custom hex`}
          value={draft}
          editable={!disabled}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          returnKeyType="done"
          placeholder="#047857"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={(next) => {
            setDraft(next);
            setError(false);
          }}
          onSubmitEditing={() => commit(draft)}
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: colors.background,
              borderColor: error ? colors.danger : colors.border,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => commit(draft)}
          style={[styles.apply, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>Apply</Text>
        </Pressable>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.hint, { color: error ? colors.danger : colors.mutedForeground }]}
      >
        {error
          ? 'Enter 3 or 6 hex digits, such as #047857.'
          : 'Choose a swatch or apply a custom hex color.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  label: { flex: 1, fontSize: 14, fontWeight: '500' },
  hex: { fontSize: 13, fontVariant: ['tabular-nums'] },
  preview: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewText: { fontSize: 24, fontWeight: '600', letterSpacing: -0.6 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { marginTop: 4, fontSize: 13, fontWeight: '500' },
  custom: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  apply: {
    minHeight: 44,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  hint: { fontSize: 12, lineHeight: 18 },
});
