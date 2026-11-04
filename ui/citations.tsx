import {
  Linking,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { safeCitationUrl, useHostAction } from './ai-tool-utils';
import { theme, useTheme } from './theme';

export interface CitationSource {
  id: string;
  title: string;
  url?: string;
  excerpt?: string;
}
export interface CitationsProps {
  sources: readonly CitationSource[];
  onOpen?: (source: CitationSource) => void | Promise<void>;
  showList?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Numbered sources with a compact chip row and optional excerpts. Only http(s) opens by default. */
export function Citations({
  sources,
  onOpen,
  showList = true,
  disabled = false,
  style,
  testID,
}: CitationsProps) {
  const { colors } = useTheme();
  const action = useHostAction(JSON.stringify(sources.map((source) => source.id)));
  const openSource = (source: CitationSource) => {
    if (disabled || action.busy) return;
    const url = safeCitationUrl(source.url);
    if (!onOpen && !url) return;
    void action.run(async () => {
      if (onOpen) await onOpen(source);
      else if (url) await Linking.openURL(url);
    });
  };
  return (
    <View testID={testID} style={[styles.root, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {sources.map((source, index) => {
          const locked = disabled || action.busy || (!onOpen && !safeCitationUrl(source.url));
          return (
            <Pressable
              key={source.id}
              accessibilityRole="link"
              accessibilityLabel={`Source ${index + 1}: ${source.title}`}
              accessibilityState={{ disabled: locked }}
              disabled={locked}
              onPress={() => openSource(source)}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.muted, borderColor: colors.border },
                (pressed || locked) && styles.dim,
              ]}
            >
              <Text style={{ color: colors.success, fontSize: 10, fontWeight: '600' }}>
                {index + 1}
              </Text>
              <Text
                numberOfLines={1}
                style={{ color: colors.foreground, fontSize: 11, maxWidth: 160 }}
              >
                {source.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {showList && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          {sources.map((source, index) => {
            const url = safeCitationUrl(source.url);
            const locked = disabled || action.busy || (!onOpen && !url);
            return (
              <Pressable
                key={source.id}
                accessibilityRole="link"
                accessibilityState={{ disabled: locked }}
                accessibilityLabel={`Source ${index + 1}: ${source.title}`}
                disabled={locked}
                onPress={() => openSource(source)}
                style={styles.source}
              >
                <Text style={[styles.number, { color: colors.success }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: colors.foreground }]}>{source.title}</Text>
                  {url && (
                    <Text style={[styles.url, { color: colors.mutedForeground }]}>
                      {new URL(url).hostname}
                    </Text>
                  )}
                  {source.excerpt && (
                    <Text style={[styles.excerpt, { color: colors.mutedForeground }]}>
                      {source.excerpt}
                    </Text>
                  )}
                </View>
                {!locked && <Text style={{ color: colors.mutedForeground }}>↗</Text>}
              </Pressable>
            );
          })}
        </View>
      )}
      {action.error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>
          {action.error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  chips: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  list: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 20 },
  source: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  number: { fontSize: 10, paddingTop: 3, fontWeight: '600' },
  copy: { flex: 1, gap: 5 },
  title: { fontSize: theme.fontSize.sm, fontWeight: '500' },
  url: { fontSize: 10 },
  excerpt: { fontSize: 12, lineHeight: 19 },
  dim: { opacity: 0.5 },
});
