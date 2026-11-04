import { type ComponentRef, type ReactNode, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { isAtChatBottom } from './chat-state';
import { useTheme } from './theme';

export interface MessageScrollerProps {
  children: ReactNode;
  followThreshold?: number;
  onAtBottomChange?: (atBottom: boolean) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Follows appended content while at the bottom. Reading older messages pauses following. */
export function MessageScroller({
  children,
  followThreshold = 72,
  onAtBottomChange,
  style,
  contentContainerStyle,
  testID,
}: MessageScrollerProps) {
  const { colors } = useTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const following = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const update = (next: boolean) => {
    if (following.current === next) return;
    following.current = next;
    setAtBottom(next);
    onAtBottomChange?.(next);
  };
  const latest = () => {
    update(true);
    scroll.current?.scrollToEnd({ animated: false });
  };
  return (
    <View testID={testID} style={[styles.root, style]}>
      <ScrollView
        ref={scroll}
        testID={testID ? `${testID}-scroll` : undefined}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        onLayout={() => {
          if (following.current) scroll.current?.scrollToEnd({ animated: false });
        }}
        onContentSizeChange={() => {
          if (following.current) scroll.current?.scrollToEnd({ animated: false });
        }}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          update(
            isAtChatBottom(
              contentOffset.y,
              contentSize.height,
              layoutMeasurement.height,
              followThreshold,
            ),
          );
        }}
      >
        {children}
      </ScrollView>
      {!atBottom && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump to latest message"
          testID={testID ? `${testID}-latest` : undefined}
          onPress={latest}
          style={({ pressed }) => [
            styles.latest,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>
            ↓ Latest
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 20, gap: 24, paddingBottom: 64 },
  latest: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    justifyContent: 'center',
  },
});
