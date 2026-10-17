import { type Context, createContext, type ReactNode, use, useEffect, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { theme, useTheme } from './theme';

const DURATION = 220;

interface AccordionBaseProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  /** Allow closing the open item by pressing it again. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

interface AccordionContextValue {
  openValues: readonly string[];
  toggle: (value: string) => void;
}

interface ItemContextValue {
  value: string;
  open: boolean;
  mounted: boolean;
  disabled: boolean;
  progress: SharedValue<number>;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

function useRequiredContext<TValue>(
  context: Context<TValue | null>,
  component: string,
  parent: string,
): TValue {
  const value = use(context);
  if (value === null) throw new Error(`<${component}> must be used within <${parent}>`);
  return value;
}

function toList(value: string | readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  return typeof value === 'string' ? [value] : [...value];
}

/**
 * Vertically stacked, collapsible sections. Controlled when `value` is passed
 * (for `type="single"`, pass `value={undefined}` to keep it controlled and closed).
 */
export function Accordion(props: AccordionProps) {
  const controlled = 'value' in props;
  const [uncontrolled, setUncontrolled] = useState(() => toList(props.defaultValue));
  const openValues = controlled ? toList(props.value) : uncontrolled;

  const toggle = (item: string) => {
    const isOpen = openValues.includes(item);
    if (props.type === 'multiple') {
      const next = isOpen ? openValues.filter((v) => v !== item) : [...openValues, item];
      if (!controlled) setUncontrolled(next);
      props.onValueChange?.(next);
      return;
    }
    if (isOpen && !props.collapsible) return;
    const next = isOpen ? undefined : item;
    if (!controlled) setUncontrolled(toList(next));
    props.onValueChange?.(next);
  };

  return (
    <AccordionContext value={{ openValues, toggle }}>
      <View style={props.style}>{props.children}</View>
    </AccordionContext>
  );
}

export interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function AccordionItem({ value, disabled = false, style, children }: AccordionItemProps) {
  const { openValues } = useRequiredContext(AccordionContext, 'AccordionItem', 'Accordion');
  const { colors } = useTheme();
  const open = openValues.includes(value);
  const progress = useSharedValue(open ? 1 : 0);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    progress.set(
      withTiming(open ? 1 : 0, { duration: DURATION }, (finished) => {
        'worklet';
        if (finished && !open) scheduleOnRN(setMounted, false);
      }),
    );
  }, [open, progress]);

  return (
    <ItemContext value={{ value, open, mounted, disabled, progress }}>
      <View style={[styles.item, { borderBottomColor: colors.border }, style]}>{children}</View>
    </ItemContext>
  );
}

export interface AccordionTriggerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccordionTrigger({ children, style, testID }: AccordionTriggerProps) {
  const { toggle } = useRequiredContext(AccordionContext, 'AccordionTrigger', 'Accordion');
  const { value, open, disabled, progress } = useRequiredContext(
    ItemContext,
    'AccordionTrigger',
    'AccordionItem',
  );
  const { colors } = useTheme();
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled }}
      disabled={disabled}
      onPress={() => toggle(value)}
      testID={testID}
      style={({ pressed }) => [
        styles.trigger,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.triggerText, { color: colors.foreground }]}>{children}</Text>
      ) : (
        children
      )}
      <Animated.View style={[styles.chevron, chevronStyle]}>
        <View style={[styles.chevronIcon, { borderColor: colors.mutedForeground }]} />
      </Animated.View>
    </Pressable>
  );
}

export interface AccordionContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccordionContent({ children, style, testID }: AccordionContentProps) {
  const { open, mounted, progress } = useRequiredContext(
    ItemContext,
    'AccordionContent',
    'AccordionItem',
  );
  const { colors } = useTheme();
  const height = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ height: height.value * progress.value }));

  if (!mounted) return null;

  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      style={[styles.contentClip, animatedStyle]}
    >
      <View
        style={styles.contentMeasure}
        onLayout={(event) => height.set(event.nativeEvent.layout.height)}
      >
        <View style={[styles.content, style]}>
          {typeof children === 'string' ? (
            <Text style={[styles.contentText, { color: colors.foreground }]}>{children}</Text>
          ) : (
            children
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  triggerText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  chevron: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    width: 8,
    height: 8,
    marginTop: -4,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  contentClip: {
    overflow: 'hidden',
  },
  contentMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
  contentText: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
