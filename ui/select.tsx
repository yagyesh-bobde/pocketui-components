import { type ComponentRef, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from './theme';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: readonly SelectOption[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

/** A native modal picker. Selecting a row commits; dismissal preserves the current value. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  label = 'Choose an option',
  placeholder = 'Select an option',
  disabled = false,
  testID,
}: SelectProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState<string | undefined>(defaultValue);
  const [open, setOpen] = useState(false);
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const selected = value === undefined ? local : value;
  const option = options.find((entry) => entry.value === selected);
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
        accessibilityValue={{ text: option?.label ?? placeholder }}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
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
          style={[styles.value, { color: option ? colors.foreground : colors.mutedForeground }]}
        >
          {option?.label ?? placeholder}
        </Text>
        <Text accessible={false} style={{ color: colors.mutedForeground }}>
          ⌄
        </Text>
      </Pressable>
      <SelectionSheet
        open={open && !disabled}
        label={label}
        options={options}
        selected={selected == null ? [] : [selected]}
        onDismiss={() => setOpen(false)}
        onAfterDismiss={() => {
          const handle = findNodeHandle(trigger.current);
          if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
        }}
        onSelect={(next) => {
          if (disabled || !options.some((entry) => entry.value === next && !entry.disabled)) return;
          if (value === undefined) setLocal(next);
          if (next !== selected) onValueChange?.(next);
          setOpen(false);
        }}
      />
    </View>
  );
}

/** Shared modal surface used by Select and MultiSelect. */
export function SelectionSheet({
  open,
  label,
  options,
  selected,
  multiple = false,
  onSelect,
  onDismiss,
  onDone,
  onAfterDismiss,
}: {
  open: boolean;
  label: string;
  options: readonly SelectOption[];
  selected: readonly string[];
  multiple?: boolean;
  onSelect: (value: string) => void;
  onDismiss: () => void;
  onDone?: () => void;
  onAfterDismiss?: () => void;
}) {
  const { colors } = useTheme();
  const title = useRef<ComponentRef<typeof Text>>(null);
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      onDismiss={onAfterDismiss}
      onShow={() => {
        const handle = findNodeHandle(title.current);
        if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
      }}
    >
      <View style={styles.overlay}>
        <Pressable accessible={false} onPress={onDismiss} style={StyleSheet.absoluteFill} />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onDismiss}
          style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <View style={styles.header}>
            <Text
              ref={title}
              accessible
              accessibilityRole="header"
              style={[styles.title, { color: colors.foreground }]}
            >
              {label}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cancel ${label}`}
              onPress={onDismiss}
              style={styles.close}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {multiple ? 'Choose any that apply, then tap Done.' : 'Choose one option.'}
          </Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.rows}
            keyboardShouldPersistTaps="handled"
          >
            {options.length === 0 && (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                No options available.
              </Text>
            )}
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole={multiple ? 'checkbox' : 'radio'}
                  accessibilityLabel={
                    option.description ? `${option.label}. ${option.description}` : option.label
                  }
                  accessibilityState={{ checked, disabled: option.disabled ?? false }}
                  disabled={option.disabled}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: checked ? colors.muted : 'transparent',
                      opacity: option.disabled ? 0.4 : pressed ? 0.65 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                  <View
                    accessible={false}
                    style={[
                      styles.mark,
                      {
                        borderColor: checked ? colors.primary : colors.border,
                        backgroundColor: checked ? colors.primary : 'transparent',
                        borderRadius: multiple ? 5 : 10,
                      },
                    ]}
                  >
                    {checked && (
                      <Text
                        style={{ color: colors.primaryForeground, fontSize: 12, fontWeight: '700' }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          {multiple && (
            <Pressable
              accessibilityRole="button"
              onPress={onDone}
              style={[styles.done, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>
                Done · {selected.length} selected
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
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
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.36)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '600' },
  close: { minHeight: 44, minWidth: 52, justifyContent: 'center', alignItems: 'center' },
  hint: { fontSize: 13, lineHeight: 19 },
  list: { flexShrink: 1 },
  rows: { gap: 4 },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: 12,
  },
  optionCopy: { flex: 1, gap: 4 },
  optionLabel: { fontSize: 15, fontWeight: '500' },
  mark: { width: 20, height: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 16, fontSize: 14 },
  done: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
});
