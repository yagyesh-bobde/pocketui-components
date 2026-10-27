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
import { orbitPoints } from './playful-utils';
import { theme, useTheme } from './theme';

export interface OrbitAction {
  key: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}
export interface OrbitMenuProps {
  actions: readonly OrbitAction[];
  label?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** An inline fan, with its own layout space, rather than an overlay or modal. */
export function OrbitMenu({
  actions,
  label = 'Create something',
  radius = 104,
  style,
  testID,
}: OrbitMenuProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const shown = actions.slice(0, 5);
  if (new Set(shown.map((action) => action.key)).size !== shown.length)
    throw new Error('OrbitMenu needs unique action keys.');
  // At narrow widths wrap the same actions into a normal row instead of overlapping targets.
  const compact = width > 0 && width < 280;
  const safeRadius = Number.isFinite(radius)
    ? Math.max(80, Math.min(140, radius, width > 0 ? (width - 76) / 2 : 104))
    : 104;
  const points = orbitPoints(shown.length, safeRadius);
  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: open ? 1 : 0,
      damping: 15,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    });
    if (motion) animation.start();
    else progress.setValue(open ? 1 : 0);
    return () => animation.stop();
  }, [open, motion, progress]);
  useEffect(() => {
    if (shown.length === 0) setOpen(false);
  }, [shown.length]);
  return (
    <View
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.root, style]}
    >
      <View style={[styles.stage, { height: compact ? undefined : safeRadius + 132 }]}>
        <View
          pointerEvents={open ? 'auto' : 'none'}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
          style={compact ? styles.compact : StyleSheet.absoluteFill}
        >
          {shown.map((action, index) => {
            const point = points[index];
            if (!point) return null;
            return (
              <Animated.View
                key={action.key}
                style={
                  compact
                    ? [styles.compactAction, { opacity: progress }]
                    : [
                        styles.orbit,
                        {
                          opacity: progress,
                          transform: [
                            { translateX: Animated.multiply(progress, point.x) },
                            { translateY: Animated.multiply(progress, point.y) },
                            {
                              scale: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.4, 1],
                              }),
                            },
                          ],
                        },
                      ]
                }
              >
                <Pressable
                  testID={testID ? `${testID}-${action.key}` : undefined}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{ disabled: action.disabled ?? false }}
                  disabled={!open || action.disabled}
                  onPress={() => {
                    setOpen(false);
                    action.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.action,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: action.disabled ? 0.35 : pressed ? 0.65 : 1,
                    },
                  ]}
                >
                  <View accessible={false} importantForAccessibility="no-hide-descendants">
                    {action.icon}
                  </View>
                </Pressable>
                <Text
                  accessible={false}
                  numberOfLines={1}
                  style={[styles.actionLabel, { color: colors.mutedForeground }]}
                >
                  {action.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
        <Pressable
          testID={testID ? `${testID}-toggle` : undefined}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close actions' : label}
          accessibilityState={{ expanded: open, disabled: shown.length === 0 }}
          disabled={shown.length === 0}
          onPress={() => setOpen((value) => !value)}
          style={({ pressed }) => [
            styles.trigger,
            compact ? styles.compactTrigger : styles.positionedTrigger,
            {
              backgroundColor: colors.primary,
              opacity: shown.length === 0 ? 0.4 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.plus,
              {
                color: colors.primaryForeground,
                transform: [
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            +
          </Animated.Text>
        </Pressable>
      </View>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>
        {open ? 'Pick a little possibility.' : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch', gap: 4 },
  stage: { position: 'relative', minHeight: 132 },
  orbit: {
    position: 'absolute',
    bottom: 44,
    left: '50%',
    width: 72,
    marginLeft: -36,
    alignItems: 'center',
    gap: 7,
  },
  action: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 10, textAlign: 'center', maxWidth: 72 },
  trigger: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionedTrigger: { position: 'absolute', bottom: 44, left: '50%', marginLeft: -32 },
  compactTrigger: { alignSelf: 'center', marginVertical: 24 },
  compact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    minHeight: 80,
  },
  compactAction: { alignItems: 'center', gap: 7 },
  plus: { fontSize: 36, lineHeight: 42, fontWeight: '300' },
  caption: { textAlign: 'center', fontSize: theme.fontSize.sm - 2 },
});
