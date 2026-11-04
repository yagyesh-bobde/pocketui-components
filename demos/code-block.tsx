import { useState } from 'react';
import { Text, View } from 'react-native';
import { CodeBlock } from '../ui/code-block';
import { useTheme } from '../ui/theme';
import { AIDemoAction, AIToolDemo } from './ai-tool-demo';

const code =
  "export function greeting(name: string) {\n  return 'Good morning, ' + name + '.';\n}\n\ngreeting('Alex');";
export default function CodeBlockDemo() {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');
  return (
    <AIToolDemo
      title={'A little code.\nReady to use.'}
      description="Selectable text, a readable gutter, and an action that belongs to your app."
    >
      <CodeBlock
        title="greeting.ts"
        language="TypeScript"
        code={code}
        actionLabel="Insert in draft"
        onAction={(value) => setDraft(value)}
        testID="ai-code-block"
      />
      <View style={{ padding: 18, gap: 12, borderRadius: 16, backgroundColor: colors.muted }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 9, letterSpacing: 1.5 }}>
          LOCAL DRAFT
        </Text>
        <Text
          selectable
          accessibilityLiveRegion="polite"
          style={{ color: colors.foreground, fontSize: 12, lineHeight: 21 }}
        >
          {draft || 'Your draft is empty. Insert the example above.'}
        </Text>
      </View>
      <AIDemoAction label="Reset draft" onPress={() => setDraft('')} />
    </AIToolDemo>
  );
}
