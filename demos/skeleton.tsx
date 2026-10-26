import { useState } from 'react';
import { Text, View } from 'react-native';
import { Skeleton, SkeletonGroup, SkeletonText } from '../ui/skeleton';
import { useTheme } from '../ui/theme';
import { DemoButton, demoStyles, EssentialsDemo } from './essentials-demo';

export default function SkeletonDemo() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  return (
    <EssentialsDemo
      title="Skeleton"
      description="Give content a place before it arrives. A gentle pulse for profiles, cards, and the next good read."
    >
      <View style={[demoStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {loading ? (
          <SkeletonGroup label="Loading your daily inspiration">
            <View style={demoStyles.row}>
              <Skeleton width={48} height={48} radius={24} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="65%" height={14} />
                <Skeleton width="40%" height={10} />
              </View>
            </View>
            <Skeleton height={160} radius={14} />
            <SkeletonText lines={3} />
          </SkeletonGroup>
        ) : (
          <View style={{ gap: 16 }}>
            <View style={demoStyles.row}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.success,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.successForeground, fontWeight: '600' }}>AL</Text>
              </View>
              <View>
                <Text style={[demoStyles.text, { color: colors.foreground, fontWeight: '600' }]}>
                  Alex Lee
                </Text>
                <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
                  A moment ago
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 160,
                borderRadius: 14,
                backgroundColor: colors.successSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.success, fontSize: 40 }}>✦</Text>
            </View>
            <Text style={[demoStyles.title, { color: colors.foreground }]}>
              Make room for a good idea.
            </Text>
            <Text style={[demoStyles.text, { color: colors.mutedForeground }]}>
              A small pause. A fresh perspective. Something worth sharing.
            </Text>
          </View>
        )}
      </View>
      <DemoButton testID="skeleton-toggle" onPress={() => setLoading((value) => !value)}>
        {loading ? 'Show loaded content' : 'Replay loading'}
      </DemoButton>
      <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
        One loading announcement. Static placeholders with reduced motion.
      </Text>
    </EssentialsDemo>
  );
}
