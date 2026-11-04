import { useEffect, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Loader } from './loader';
import { theme, useTheme } from './theme';

export type ImageGenerationStatus = 'pending' | 'complete' | 'error';
export interface ImageGenerationProps {
  status: ImageGenerationStatus;
  prompt: string;
  image?: ImageSourcePropType;
  imageAccessibilityLabel?: string;
  aspectRatio?: number;
  caption?: string;
  errorMessage?: string;
  onRetry?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Display a host-owned image request. No model call, file upload, or generation is started here. */
export function ImageGeneration({
  status,
  prompt,
  image,
  imageAccessibilityLabel = prompt,
  aspectRatio = 4 / 3,
  caption,
  errorMessage = 'The image request could not be completed.',
  onRetry,
  disabled = false,
  style,
  testID,
}: ImageGenerationProps) {
  const { colors } = useTheme();
  const [failedImage, setFailedImage] = useState<ImageSourcePropType>();
  useEffect(() => {
    if (status !== 'complete') setFailedImage(undefined);
  }, [status]);
  const loadFailed = image !== undefined && failedImage === image;
  const ratio = Number.isFinite(aspectRatio) ? Math.max(0.5, Math.min(2, aspectRatio)) : 4 / 3;
  const hasImage = status === 'complete' && image !== undefined && !loadFailed;
  const failed = status === 'error' || loadFailed || (status === 'complete' && image === undefined);
  const message = loadFailed
    ? 'The supplied image could not be loaded.'
    : status === 'complete' && image === undefined
      ? 'No image was supplied for this result.'
      : errorMessage;
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={[styles.media, { aspectRatio: ratio, backgroundColor: colors.muted }]}>
        {hasImage ? (
          <Image
            source={image}
            accessibilityLabel={imageAccessibilityLabel}
            accessible
            resizeMode="cover"
            onError={() => setFailedImage(image)}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.state}>
            {failed ? (
              <Text style={{ color: colors.danger, fontSize: 28 }}>!</Text>
            ) : (
              <Loader size={30} color={colors.success} label="Image request pending" />
            )}
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.stateTitle, { color: failed ? colors.danger : colors.foreground }]}
            >
              {failed ? 'Image unavailable' : 'Creating a little possibility'}
            </Text>
            <Text style={[styles.message, { color: colors.mutedForeground }]}>
              {failed ? message : 'Waiting for an image from your app.'}
            </Text>
            {failed && onRetry && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={onRetry}
                style={[styles.retry, { borderColor: colors.border }, disabled && styles.dim]}
              >
                <Text style={{ color: colors.foreground, fontSize: 12 }}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>PROMPT</Text>
        <Text selectable style={[styles.prompt, { color: colors.foreground }]}>
          {prompt}
        </Text>
        {caption && (
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  media: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  state: { padding: 22, alignItems: 'center', gap: 12 },
  stateTitle: { fontSize: theme.fontSize.sm, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 11, lineHeight: 18, textAlign: 'center' },
  retry: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 9,
    justifyContent: 'center',
    marginTop: 4,
  },
  copy: { padding: 16, gap: 8 },
  label: { fontSize: 9, letterSpacing: 1.5 },
  prompt: { fontSize: 13, lineHeight: 21 },
  caption: { fontSize: 10, lineHeight: 17 },
  dim: { opacity: 0.5 },
});
