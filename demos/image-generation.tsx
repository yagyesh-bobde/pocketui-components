import { useState } from 'react';
import { ImageGeneration, type ImageGenerationStatus } from '../ui/image-generation';
import { AIDemoAction, AIDemoRow, AIToolDemo } from './ai-tool-demo';

export default function ImageGenerationDemo() {
  const [status, setStatus] = useState<ImageGenerationStatus>('complete');
  return (
    <AIToolDemo
      title={'An image request.\nEvery state covered.'}
      description="Make room for the wait, the result, and a useful way to try again."
    >
      <ImageGeneration
        status={status}
        prompt="A colorful city street, full of small everyday stories."
        image={require('./assets/feed-footer/street.webp')}
        imageAccessibilityLabel="Existing local sample of a colorful street"
        caption="Existing local sample image. No model request is made."
        onRetry={() => setStatus('pending')}
        errorMessage="This is a demo failure state. You can request a local retry."
        testID="ai-image-generation"
      />
      <AIDemoRow>
        {(['pending', 'complete', 'error'] as const).map((value) => (
          <AIDemoAction
            key={value}
            label={value === 'pending' ? 'Pending' : value === 'complete' ? 'Complete' : 'Error'}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </AIDemoRow>
    </AIToolDemo>
  );
}
