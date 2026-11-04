import { type ComponentRef, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInteractionMotion } from './interaction-motion';
import { menuPosition, type Rect } from './interaction-utils';
import { theme, useTheme } from './theme';

export interface MenuAction {
  key: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface MenuProps {
  trigger: ReactNode;
  accessibilityLabel: string;
  items: readonly MenuAction[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  align?: 'start' | 'end';
  width?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A press-to-open action menu that flips above its trigger and stays inside the safe viewport. */
export function Menu({
  trigger,
  accessibilityLabel,
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  align = 'end',
  width = 260,
  style,
  testID,
}: MenuProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const motion = useInteractionMotion();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const requested = (open ?? localOpen) && !disabled && items.length > 0;
  const requestedRef = useRef(requested);
  requestedRef.current = requested;
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const firstActionRef = useRef<ComponentRef<typeof View>>(null);
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const mounted = useRef(true);
  const selected = useRef(false);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState<Rect | null>(null);
  const [height, setHeight] = useState(0);
  const firstEnabled = items.findIndex((item) => !item.disabled);
  const positioned = viewport !== null;

  useEffect(() => {
    if (!requested || !positioned) return;
    const frame = requestAnimationFrame(() => {
      const node = findNodeHandle(firstActionRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    });
    return () => cancelAnimationFrame(frame);
  }, [requested, positioned]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const measureTrigger = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      if (!mounted.current || !requestedRef.current || measuredWidth <= 0 || measuredHeight <= 0)
        return;
      setAnchor({ x, y, width: measuredWidth, height: measuredHeight });
    });
  }, []);
  useEffect(() => {
    if (requested) selected.current = false;
  }, [requested]);
  useEffect(() => {
    if (requested && window.width > 0 && window.height > 0) {
      measureTrigger();
    } else {
      setAnchor(null);
      setViewport(null);
      setHeight(0);
    }
  }, [requested, window.width, window.height, measureTrigger]);

  const changeOpen = (next: boolean) => {
    if (open === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };
  const close = () => changeOpen(false);
  const menuWidth = Math.max(
    48,
    Math.min(Number.isFinite(width) ? width : 260, (viewport?.width ?? window.width) - 24),
  );
  const safeTop = Math.max(0, insets.top - (viewport?.y ?? 0));
  const maxHeight = Math.max(
    48,
    (viewport?.height ?? window.height) - safeTop - insets.bottom - 24,
  );
  const origin = anchor ?? { x: 0, y: 0, width: 0, height: 0 };
  const position = menuPosition(
    {
      ...origin,
      x: origin.x - (viewport?.x ?? 0) + (align === 'end' ? origin.width - menuWidth : 0),
      y: origin.y - (viewport?.y ?? 0),
    },
    {
      x: 0,
      y: safeTop,
      width: viewport?.width ?? window.width,
      height: (viewport?.height ?? window.height) - safeTop - insets.bottom,
    },
    { width: menuWidth, height: Math.min(height || items.length * 64 + 12, maxHeight) },
  );

  return (
    <>
      <Pressable
        ref={triggerRef}
        collapsable={false}
        onLayout={() => {
          if (requested) measureTrigger();
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens an actions menu"
        accessibilityState={{ expanded: requested, disabled: disabled || items.length === 0 }}
        disabled={disabled || items.length === 0}
        onPress={() => changeOpen(!requested)}
        testID={testID ? `${testID}-trigger` : undefined}
        style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
      >
        {trigger}
      </Pressable>
      <Modal
        visible={requested && anchor !== null}
        transparent
        animationType={motion ? 'fade' : 'none'}
        onRequestClose={close}
        supportedOrientations={['portrait', 'landscape']}
        onDismiss={() => {
          const node = findNodeHandle(triggerRef.current);
          if (node && !requestedRef.current) AccessibilityInfo.setAccessibilityFocus(node);
        }}
      >
        <View
          ref={rootRef}
          style={styles.root}
          accessibilityViewIsModal
          onAccessibilityEscape={close}
          onLayout={() =>
            rootRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
              if (mounted.current && requestedRef.current)
                setViewport({ x, y, width: measuredWidth, height: measuredHeight });
            })
          }
        >
          <Pressable
            ref={firstEnabled === -1 ? firstActionRef : undefined}
            accessibilityRole="button"
            accessibilityLabel="Dismiss menu"
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View
            testID={testID}
            onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
            style={[
              styles.menu,
              { backgroundColor: colors.card, borderColor: colors.border },
              style,
              {
                ...position,
                width: menuWidth,
                maxHeight,
                opacity: viewport ? 1 : 0,
              },
            ]}
          >
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.list}
            >
              {items.map((item, index) => (
                <Pressable
                  ref={index === firstEnabled ? firstActionRef : undefined}
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityHint={item.description}
                  accessibilityState={{ disabled: item.disabled ?? false }}
                  disabled={item.disabled}
                  testID={testID ? `${testID}-${item.key}` : undefined}
                  onPress={() => {
                    if (selected.current) return;
                    selected.current = true;
                    close();
                    item.onSelect();
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { backgroundColor: colors.muted },
                    item.disabled && styles.disabled,
                  ]}
                >
                  {item.icon && <View style={styles.icon}>{item.icon}</View>}
                  <View style={styles.copy}>
                    <Text
                      style={[
                        styles.label,
                        { color: item.destructive ? colors.danger : colors.foreground },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text style={[styles.description, { color: colors.mutedForeground }]}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#00000018' },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  list: { padding: 6, gap: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    padding: 12,
    borderRadius: theme.radius.lg,
  },
  icon: { width: 24, alignItems: 'center' },
  copy: { flex: 1, gap: 3 },
  label: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium },
  description: { fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
