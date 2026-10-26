import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '../ui/bottom-sheet';
import { useTheme } from '../ui/theme';
import { DemoButton, demoStyles, EssentialsDemo } from './essentials-demo';

export default function BottomSheetDemo() {
  const { colors } = useTheme();
  const [kind, setKind] = useState<'filters' | 'actions' | 'form' | null>(null);
  const [selected, setSelected] = useState('All projects');
  const [message, setMessage] = useState('A little room for the details.');
  return (
    <EssentialsDemo
      title="Bottom Sheet"
      description="A focused space for filters, quick actions, and a little more detail. Drag the handle to find your fit."
    >
      <View
        style={[demoStyles.card, { backgroundColor: colors.muted, borderColor: colors.border }]}
      >
        <Text style={[demoStyles.title, { color: colors.foreground }]}>
          Your workspace, in focus.
        </Text>
        <Text style={[demoStyles.text, { color: colors.mutedForeground }]}>{message}</Text>
      </View>
      <DemoButton testID="sheet-filters" onPress={() => setKind('filters')}>
        Filter projects
      </DemoButton>
      <DemoButton testID="sheet-actions" secondary onPress={() => setKind('actions')}>
        Quick actions
      </DemoButton>
      <DemoButton testID="sheet-form" secondary onPress={() => setKind('form')}>
        Add a note
      </DemoButton>
      <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
        Two snap points. Scrollable content. Keyboard-aware forms.
      </Text>
      <DemoButton
        testID="sheet-reset"
        secondary
        onPress={() => {
          setSelected('All projects');
          setMessage('A little room for the details.');
        }}
      >
        Reset example
      </DemoButton>
      <BottomSheet
        open={kind !== null}
        onOpenChange={(open) => {
          if (!open) setKind(null);
        }}
        title={
          kind === 'form'
            ? 'A note to remember'
            : kind === 'actions'
              ? 'Make it yours'
              : 'Find your focus'
        }
        description="Pull the handle up for more room, or down to dismiss."
        testID="demo-sheet"
        footer={
          <DemoButton
            testID="sheet-apply"
            onPress={() => {
              setMessage(
                kind === 'filters'
                  ? `Showing ${selected.toLowerCase()}.`
                  : kind === 'form'
                    ? 'Your note is saved.'
                    : 'All set. Make something good.',
              );
              setKind(null);
            }}
          >
            {kind === 'form' ? 'Save note' : 'Done'}
          </DemoButton>
        }
      >
        {kind === 'filters' ? (
          [
            'All projects',
            'Recently opened',
            'Favorites',
            'Shared with me',
            'Personal',
            'Work',
            'Archived',
          ].map((label) => (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === label }}
              testID={`filter-${label}`}
              onPress={() => setSelected(label)}
              style={[demoStyles.row, { paddingVertical: 14 }]}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: selected === label ? 6 : 1,
                  borderColor: selected === label ? colors.success : colors.border,
                }}
              />
              <Text style={[demoStyles.text, { color: colors.foreground }]}>{label}</Text>
            </Pressable>
          ))
        ) : kind === 'form' ? (
          <TextInput
            testID="sheet-note"
            accessibilityLabel="Your note"
            placeholder="What’s on your mind?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={{
              minHeight: 110,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              color: colors.foreground,
              fontSize: 16,
              textAlignVertical: 'top',
            }}
          />
        ) : (
          ['Share project', 'Duplicate project', 'Move to folder'].map((label) => (
            <DemoButton
              key={label}
              testID={`sheet-${label}`}
              secondary
              onPress={() => {
                setMessage(`${label} selected.`);
                setKind(null);
              }}
            >
              {label}
            </DemoButton>
          ))
        )}
      </BottomSheet>
    </EssentialsDemo>
  );
}
