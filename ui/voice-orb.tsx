import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useInteractionMotion } from './interaction-motion';
import { theme, useTheme } from './theme';

export type VoiceOrbStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export interface VoiceOrbProps {
  status: VoiceOrbStatus;
  intensity?: number;
  size?: number;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A controlled visual voice state. It never accesses the microphone or starts audio playback. */
export function VoiceOrb({
  status,
  intensity = 0.5,
  size = 112,
  label,
  onPress,
  disabled = false,
  style,
  testID,
}: VoiceOrbProps) {
  const { colors } = useTheme();
  const motion = useInteractionMotion();
  const phase = useRef(new Animated.Value(0)).current;
  const dimension = Number.isFinite(size) ? Math.max(48, Math.min(240, size)) : 112;
  const level = Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 0.5;
  const active = status !== 'idle' && status !== 'error';
  const tint =
    status === 'error' ? colors.danger : status === 'thinking' ? colors.foreground : colors.success;
  const statusLabel =
    label ??
    (
      {
        idle: 'Ready when you are',
        listening: 'Listening',
        thinking: 'Thinking it through',
        speaking: 'Speaking',
        error: 'Voice unavailable',
      } satisfies Record<VoiceOrbStatus, string>
    )[status];
  useEffect(() => {
    phase.setValue(0);
    if (!active || !motion) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, {
          toValue: 1,
          duration: status === 'thinking' ? 1400 : 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(phase, {
          toValue: 0,
          duration: status === 'thinking' ? 1400 : 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
      phase.setValue(0);
    };
  }, [active, motion, status, phase]);
  const visual = (
    <>
      <View
        style={{
          width: dimension * 1.4,
          height: dimension * 1.4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: dimension * 1.15,
            height: dimension * 1.15,
            borderRadius: dimension,
            backgroundColor: tint,
            opacity: phase.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
            transform: [
              {
                scale: phase.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1 + level * 0.1],
                }),
              },
            ],
          }}
        />
        <Animated.View
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: tint,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: [
              {
                scale: phase.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1 + level * 0.08],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -dimension * 0.2,
              left: dimension * 0.1,
              width: dimension * 0.85,
              height: dimension * 0.85,
              borderRadius: dimension,
              backgroundColor: '#ffffff',
              opacity: 0.12,
            }}
          />
          <Text
            style={{
              color:
                status === 'thinking'
                  ? colors.background
                  : status === 'error'
                    ? colors.dangerForeground
                    : colors.successInk,
              fontSize: dimension * 0.27,
              fontWeight: '500',
            }}
          >
            {status === 'error'
              ? '!'
              : status === 'thinking'
                ? '⋯'
                : status === 'idle'
                  ? '○'
                  : status === 'speaking'
                    ? '♪'
                    : '●'}
          </Text>
        </Animated.View>
      </View>
      <Text
        style={[
          styles.label,
          { color: status === 'error' ? colors.danger : colors.mutedForeground },
        ]}
      >
        {statusLabel}
      </Text>
    </>
  );
  return onPress ? (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={statusLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, style, (disabled || pressed) && styles.dim]}
    >
      {visual}
    </Pressable>
  ) : (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={statusLabel}
      style={[styles.root, style]}
    >
      {visual}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: 10, padding: 8 },
  label: { fontSize: theme.fontSize.sm, textAlign: 'center' },
  dim: { opacity: 0.5 },
});
