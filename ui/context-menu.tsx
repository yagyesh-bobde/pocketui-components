import { type ComponentRef, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInteractionMotion } from './interaction-motion';
import { menuPosition, type Rect } from './interaction-utils';
import { theme, useTheme } from './theme';

export interface ContextMenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}
export interface ContextMenuProps {
  trigger: ReactNode;
  items: readonly ContextMenuItem[];
  accessibilityLabel: string;
  onOpenChange?: (open: boolean) => void;
  testID?: string;
}

/** Tap or long-press to open an anchored, scrollable menu inside the safe viewport. */
export function ContextMenu({
  trigger,
  items,
  accessibilityLabel,
  onOpenChange,
  testID,
}: ContextMenuProps) {
  const { colors } = useTheme();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const motion = useInteractionMotion();
  const anchorRef = useRef<ComponentRef<typeof View>>(null);
  const alive = useRef(true);
  const selected = useRef(false);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [height, setHeight] = useState(0);
  const [triggerSize, setTriggerSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const viewport = useRef({ width: window.width, height: window.height });
  useEffect(() => {
    if (viewport.current.width === window.width && viewport.current.height === window.height)
      return;
    viewport.current = { width: window.width, height: window.height };
    setAnchor(null);
    onOpenChange?.(false);
  }, [window.width, window.height, onOpenChange]);
  const close = () => {
    setAnchor(null);
    onOpenChange?.(false);
  };
  const open = () => {
    if (items.length === 0) return;
    anchorRef.current?.measureInWindow((x, y, width, measuredHeight) => {
      if (!alive.current || width <= 0 || measuredHeight <= 0) return;
      selected.current = false;
      setHeight(0);
      setAnchor({ x, y, width, height: measuredHeight });
      onOpenChange?.(true);
      AccessibilityInfo.announceForAccessibility(`${accessibilityLabel}. ${items.length} actions`);
    });
  };
  const maxHeight = Math.max(44, window.height - insets.top - insets.bottom - 24);
  const menuWidth = Math.min(256, window.width - 24);
  const position = menuPosition(
    anchor ?? { x: 0, y: 0, ...triggerSize },
    {
      x: 0,
      y: insets.top,
      width: window.width,
      height: window.height - insets.top - insets.bottom,
    },
    { width: menuWidth, height: Math.min(height || items.length * 48 + 12, maxHeight) },
  );
  return (
    <>
      <View
        ref={anchorRef}
        collapsable={false}
        onLayout={(event) => setTriggerSize(event.nativeEvent.layout)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Opens an actions menu"
          accessibilityState={{ expanded: anchor !== null, disabled: items.length === 0 }}
          disabled={items.length === 0}
          onPress={open}
          onLongPress={open}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          {trigger}
        </Pressable>
      </View>
      <Modal
        visible={anchor !== null}
        transparent
        animationType={motion ? 'fade' : 'none'}
        onRequestClose={close}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.overlay} accessibilityViewIsModal onAccessibilityEscape={close}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss menu"
            style={StyleSheet.absoluteFill}
            onPress={close}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
          <View
            testID={testID}
            onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
            style={[
              styles.menu,
              {
                ...position,
                width: menuWidth,
                maxHeight,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ScrollView bounces={false} contentContainerStyle={styles.list}>
              {items.map((item) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
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
                  <Text
                    style={[
                      styles.label,
                      { color: item.destructive ? colors.danger : colors.foreground },
                    ]}
                  >
                    {item.label}
                  </Text>
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
  overlay: { flex: 1, backgroundColor: '#00000044' },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  list: { padding: 6 },
  item: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
  },
  label: { fontSize: theme.fontSize.sm, fontWeight: '500' },
  disabled: { opacity: 0.4 },
});
