import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type LoadingPhase, LoadingStates } from '../ui/loading-states';
import { useTheme } from '../ui/theme';

const phases: readonly LoadingPhase[] = ['thinking', 'searching', 'writing'];

export default function LoadingStatesDemo() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % phases.length), 2400);
    return () => clearInterval(timer);
  }, [active]);
  const phase = phases[index] ?? 'thinking';
  return (
    <View style={styles.screen}>
      <Text style={[styles.eyebrow, { color: colors.success }]}>
        POCKETUI / LOCAL ACTIVITY PREVIEW
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        A little patience.{'\n'}A little presence.
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        Keep the quiet moments clear. Let people know what comes next.
      </Text>
      <View style={styles.preview}>
        {active ? (
          <LoadingStates
            phase={phase}
            detail="A sample phase, supplied by this demo."
            onCancel={() => setActive(false)}
            testID="loading-current"
          />
        ) : (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.mutedForeground, fontSize: 13 }}
          >
            Sample activity paused.
          </Text>
        )}
      </View>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>
        THREE WAYS TO KEEP THE CONVERSATION MOVING
      </Text>
      {phases.map((item, phaseIndex) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: active && index === phaseIndex }}
          onPress={() => {
            setIndex(phaseIndex);
            setActive(true);
          }}
          testID={`loading-${item}`}
          style={[
            styles.option,
            { borderColor: active && index === phaseIndex ? colors.primary : colors.border },
          ]}
        >
          <Text style={{ color: colors.foreground, fontSize: 13, textTransform: 'capitalize' }}>
            {item}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            {active && index === phaseIndex ? '●' : '↗'}
          </Text>
        </Pressable>
      ))}
      <LoadingStates
        phase="thinking"
        label="A quieter, compact state"
        compact
        detail="Motion follows the device preference."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 40, gap: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.3 },
  title: { fontSize: 32, lineHeight: 39, letterSpacing: -1, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 22 },
  preview: { minHeight: 100, justifyContent: 'center' },
  caption: { fontSize: 9, lineHeight: 16, letterSpacing: 1 },
  option: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
