import { StyleSheet, Text, View } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { theme, useTheme } from '../ui/theme';

export default function AccordionDemo() {
  const { colors } = useTheme();
  const paragraph = [styles.paragraph, { color: colors.foreground }];
  const heading = [styles.heading, { color: colors.mutedForeground }];

  return (
    <View style={styles.container}>
      <Text style={heading}>Single</Text>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger testID="accordion-trigger-item-1">Is it accessible?</AccordionTrigger>
          <AccordionContent testID="accordion-content-item-1">
            Yes. Each trigger is a button that reports its expanded state to screen readers.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger testID="accordion-trigger-item-2">Is it animated?</AccordionTrigger>
          <AccordionContent testID="accordion-content-item-2">
            Yes. Height and chevron animate on the UI thread with Reanimated.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger testID="accordion-trigger-item-3">
            Does it fit long content?
          </AccordionTrigger>
          <AccordionContent testID="accordion-content-item-3">
            <View style={styles.paragraphs}>
              <Text style={paragraph}>
                Content is measured before it animates, so panels of any height open fully instead
                of clipping.
              </Text>
              <Text style={paragraph}>
                Text that wraps across several lines, or content that changes after mount, is
                re-measured automatically.
              </Text>
              <Text style={paragraph}>Last line of item three.</Text>
            </View>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Text style={heading}>Multiple</Text>
      <Accordion type="multiple" defaultValue={['multi-1']}>
        <AccordionItem value="multi-1">
          <AccordionTrigger testID="accordion-trigger-multi-1">
            Can several stay open?
          </AccordionTrigger>
          <AccordionContent testID="accordion-content-multi-1">
            Yes. With type="multiple", opening one item leaves the others as they are.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="multi-2">
          <AccordionTrigger testID="accordion-trigger-multi-2">
            Can it be controlled?
          </AccordionTrigger>
          <AccordionContent testID="accordion-content-multi-2">
            Yes. Pass value and onValueChange to control it, or defaultValue to let it manage
            itself.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
  },
  paragraphs: {
    gap: theme.spacing.sm,
  },
  paragraph: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
