import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

export interface ExpandableControlProps {
  label: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A compact control that reveals a measured toolbar or group of related settings. */
export function ExpandableControl({
  label,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  style,
  contentStyle,
  testID,
}: ExpandableControlProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const expanded = open ?? localOpen;
  const [height, setHeight] = useState(0);
  const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: motion ? 220 : 0,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [expanded, motion, progress]);

  return (
    <View
      style={[styles.root, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded, disabled }}
        disabled={disabled}
        testID={testID ? `${testID}-trigger` : undefined}
        onPress={() => {
          if (open === undefined) setLocalOpen(!expanded);
          onOpenChange?.(!expanded);
        }}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.indicator,
            { backgroundColor: expanded ? colors.successSurface : colors.muted },
          ]}
        >
          <Text
            style={[styles.indicatorText, { color: expanded ? colors.success : colors.foreground }]}
          >
            {expanded ? '−' : '+'}
          </Text>
        </View>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {expanded ? 'Hide' : 'Show'}
        </Text>
      </Pressable>
      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
        style={{
          overflow: 'hidden',
          height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] }),
          opacity: progress,
        }}
      >
        <View
          testID={testID ? `${testID}-content` : undefined}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[styles.content, { borderTopColor: colors.border }, contentStyle]}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  trigger: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: { fontSize: 22, lineHeight: 26 },
  label: { flex: 1, fontSize: theme.fontSize.sm, fontWeight: '600' },
  hint: { fontSize: 11 },
  content: {
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.md,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
