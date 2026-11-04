import { Text } from 'react-native';
import { FileDiff } from '../ui/file-diff';
import { useTheme } from '../ui/theme';
import { AIToolDemo } from './ai-tool-demo';

export default function FileDiffDemo() {
  const { colors } = useTheme();
  return (
    <AIToolDemo
      title={'A clear change.\nNothing hidden.'}
      description="A small review surface for the exact lines your app proposes to change."
    >
      <FileDiff
        filename="theme.ts"
        oldStart={12}
        newStart={12}
        lines={[
          { type: 'context', text: 'export const reading = {' },
          { type: 'removed', text: '  lineHeight: 20,' },
          { type: 'added', text: '  lineHeight: 24,' },
          { type: 'removed', text: '  paragraphGap: 8,' },
          { type: 'added', text: '  paragraphGap: 16,' },
          { type: 'added', text: '  maxWidth: 640,' },
          {
            type: 'added',
            text: "  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),",
          },
          { type: 'context', text: '};' },
        ]}
        testID="ai-file-diff"
      />
      <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 21 }}>
        Added and removed counts describe only the lines shown. Horizontal scrolling keeps long
        lines intact.
      </Text>
    </AIToolDemo>
  );
}
