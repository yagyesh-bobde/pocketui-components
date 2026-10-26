import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../ui/theme';
import { ToastProvider, useToast } from '../ui/toast';
import { DemoButton, demoStyles, EssentialsDemo } from './essentials-demo';

function ToastExamples() {
  const { toast, dismiss } = useToast();
  const { colors } = useTheme();
  const [status, setStatus] = useState('Everything is right where you left it.');
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <EssentialsDemo
        title="Toast"
        description="A quiet update that stays out of the way. Success, a retry, or one last chance to undo."
      >
        <View
          style={[demoStyles.card, { backgroundColor: colors.muted, borderColor: colors.border }]}
        >
          <Text style={[demoStyles.title, { color: colors.foreground }]}>
            Small updates. Clear feedback.
          </Text>
          <Text testID="toast-status" style={[demoStyles.text, { color: colors.mutedForeground }]}>
            {status}
          </Text>
        </View>
        <DemoButton
          testID="toast-success-button"
          onPress={() =>
            toast({
              title: 'Changes saved',
              description: 'Your workspace is up to date.',
              variant: 'success',
            })
          }
        >
          Show success
        </DemoButton>
        <DemoButton
          testID="toast-error-button"
          secondary
          onPress={() =>
            toast({
              title: 'Couldn’t connect',
              description: 'Check your connection and try again.',
              variant: 'error',
              duration: 8000,
              action: {
                label: 'Retry',
                onPress: () => {
                  setStatus('Connected. You’re back in sync.');
                  toast({ title: 'Back online', variant: 'success' });
                },
              },
            })
          }
        >
          Show error with retry
        </DemoButton>
        <DemoButton
          testID="toast-undo-button"
          secondary
          onPress={() => {
            setStatus('The note was archived.');
            toast({
              title: 'Note archived',
              description: 'You can bring it back.',
              duration: 0,
              action: {
                label: 'Undo',
                onPress: () => setStatus('Restored. Just like you left it.'),
              },
            });
          }}
        >
          Archive with undo
        </DemoButton>
        <DemoButton
          testID="toast-clear"
          secondary
          onPress={() => {
            dismiss();
            setStatus('Everything is right where you left it.');
          }}
        >
          Clear notifications
        </DemoButton>
        <Text style={[demoStyles.caption, { color: colors.mutedForeground }]}>
          Up to three notifications. Timers pause in the background and while you touch a toast.
        </Text>
      </EssentialsDemo>
    </ScrollView>
  );
}
export default function ToastDemo() {
  return (
    <ToastProvider>
      <ToastExamples />
    </ToastProvider>
  );
}
