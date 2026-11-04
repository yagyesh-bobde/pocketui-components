import { useState } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ui/theme';
import { VoiceOrb, type VoiceOrbStatus } from '../ui/voice-orb';
import { AIDemoAction, AIDemoRow, AIToolDemo } from './ai-tool-demo';

export default function VoiceOrbDemo() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<VoiceOrbStatus>('listening');
  const [intensity, setIntensity] = useState(0.6);
  return (
    <AIToolDemo
      title={'Give the moment\na little shape.'}
      description="A visual voice state that stays in step with your app, and the system’s motion preference."
    >
      <VoiceOrb status={status} intensity={intensity} size={140} testID="ai-voice-orb" />
      <AIDemoRow>
        {(['idle', 'listening', 'thinking', 'speaking', 'error'] as const).map((value) => (
          <AIDemoAction
            key={value}
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </AIDemoRow>
      <AIDemoAction
        label={intensity > 0.5 ? 'Use a softer intensity' : 'Use a stronger intensity'}
        onPress={() => setIntensity((value) => (value > 0.5 ? 0.2 : 0.8))}
      />
      <Text style={{ color: colors.mutedForeground, fontSize: 11, lineHeight: 19 }}>
        Visual states only. This demo never accesses the microphone or plays audio.
      </Text>
    </AIToolDemo>
  );
}
