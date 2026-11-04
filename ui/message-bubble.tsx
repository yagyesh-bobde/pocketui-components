import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageMeta,
  type MessageRole,
} from './message';
import { useTheme } from './theme';

export interface MessageBubbleProps {
  children: ReactNode;
  from?: MessageRole;
  name?: string;
  time?: string;
  avatar?: ReactNode;
  showAvatar?: boolean;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** User, assistant and system surfaces; pass Text or your own message body as children. */
export function MessageBubble({
  children,
  from = 'assistant',
  name,
  time,
  avatar,
  showAvatar = true,
  footer,
  style,
  testID,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const author = name ?? (from === 'user' ? 'You' : from === 'system' ? 'System' : 'Assistant');
  return (
    <Message from={from} testID={testID} style={style}>
      {showAvatar && <MessageAvatar label={author}>{avatar}</MessageAvatar>}
      <MessageContent>
        <MessageHeader style={from === 'user' ? styles.userHeader : undefined}>
          <Text style={[styles.author, { color: colors.foreground }]}>{author}</Text>
          {time && <MessageMeta>{time}</MessageMeta>}
        </MessageHeader>
        <View
          style={[
            styles.bubble,
            from === 'user' && styles.userBubble,
            {
              backgroundColor: from === 'user' ? colors.muted : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {children}
        </View>
        {footer}
      </MessageContent>
    </Message>
  );
}

const styles = StyleSheet.create({
  author: { fontSize: 12, fontWeight: '600' },
  userHeader: { justifyContent: 'flex-end' },
  bubble: { borderWidth: 1, padding: 14, borderRadius: 16, borderTopStartRadius: 4, gap: 8 },
  userBubble: { borderTopStartRadius: 16, borderTopEndRadius: 4 },
});
