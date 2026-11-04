import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Pressable, StyleSheet, Text, View } from 'react-native';
import { SelectionSheet, type SelectOption } from './select';
import { useTheme } from './theme';

export interface MultiSelectProps {
  options: readonly SelectOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

/** A draft selection is committed with Done. Cancel, backdrop and system Back discard it. */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  label = 'Choose your options',
  placeholder = 'Select options',
  disabled = false,
  testID,
}: MultiSelectProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState<readonly string[]>(defaultValue);
  const [draft, setDraft] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const selected = options.filter((option) => (value ?? local).includes(option.value));
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <Pressable
        ref={trigger}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{
          text: selected.length ? selected.map((option) => option.label).join(', ') : placeholder,
        }}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => {
          setDraft(selected.map((option) => option.value));
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.value,
            { color: selected.length ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {selected.length ? `${selected.length} selected` : placeholder}
        </Text>
        <Text accessible={false} style={{ color: colors.mutedForeground }}>
          ⌄
        </Text>
      </Pressable>
      {selected.length > 0 && (
        <View style={styles.chips}>
          {selected.map((option) => (
            <View key={option.value} style={[styles.chip, { backgroundColor: colors.muted }]}>
              <Text style={{ color: colors.foreground, fontSize: 12 }}>{option.label}</Text>
            </View>
          ))}
        </View>
      )}
      <SelectionSheet
        multiple
        open={open && !disabled}
        label={label}
        options={options}
        selected={draft}
        onDismiss={() => setOpen(false)}
        onAfterDismiss={() => {
          const handle = findNodeHandle(trigger.current);
          if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
        }}
        onSelect={(next) => {
          if (disabled || !options.some((option) => option.value === next && !option.disabled))
            return;
          setDraft((current) =>
            current.includes(next) ? current.filter((entry) => entry !== next) : [...current, next],
          );
        }}
        onDone={() => {
          if (disabled) return;
          const next = options
            .filter((option) => draft.includes(option.value))
            .map((option) => option.value);
          if (value === undefined) setLocal(next);
          const previous = selected.map((option) => option.value);
          if (
            previous.length !== next.length ||
            previous.some((entry, index) => entry !== next[index])
          )
            onValueChange?.(next);
          setOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500' },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  value: { flex: 1, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
});
