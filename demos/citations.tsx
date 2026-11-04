import { useState } from 'react';
import { Text } from 'react-native';
import { Citations } from '../ui/citations';
import { useTheme } from '../ui/theme';
import { AIToolDemo } from './ai-tool-demo';

export default function CitationsDemo() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState('Select a source to inspect its title.');
  return (
    <AIToolDemo
      title={'A good answer.\nWith a way back.'}
      description="Keep source material close to the response, with numbered links and a clear trail."
    >
      <Text style={{ color: colors.foreground, fontSize: 15, lineHeight: 25 }}>
        Native accessibility roles and a system-aware color scheme help a small interface fit the
        device it lives on.
      </Text>
      <Citations
        sources={[
          {
            id: 'accessibility',
            title: 'React Native accessibility',
            url: 'https://reactnative.dev/docs/accessibility',
            excerpt: 'Roles, labels, hints, and states for native assistive technology.',
          },
          {
            id: 'appearance',
            title: 'System color scheme',
            url: 'https://reactnative.dev/docs/usecolorscheme',
            excerpt: 'Respond to changes in the active system color scheme.',
          },
        ]}
        onOpen={(source) => setSelected(`Selected: ${source.title}`)}
        testID="ai-citations"
      />
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: colors.success, fontSize: 12, lineHeight: 20 }}
      >
        {selected}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, lineHeight: 18 }}>
        This demo handles selection locally. Without an onOpen handler, valid http(s) links open
        through the device.
      </Text>
    </AIToolDemo>
  );
}
