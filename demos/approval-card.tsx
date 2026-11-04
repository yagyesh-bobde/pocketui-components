import { useState } from 'react';
import { ApprovalCard } from '../ui/approval-card';
import type { ToolApprovalStatus } from '../ui/tool-approval';
import { AIDemoAction, AIToolDemo } from './ai-tool-demo';

export default function ApprovalCardDemo() {
  const [status, setStatus] = useState<ToolApprovalStatus>('pending');
  const [request, setRequest] = useState(1);
  return (
    <AIToolDemo
      title={'See the details.\nThen decide.'}
      description="Make the proposed change concrete before someone gives it permission."
    >
      <ApprovalCard
        requestId={`draft-${request}`}
        toolName="mail.send_draft"
        action="Send the project update?"
        description="Review the recipient and content before your app sends anything."
        details={[
          { label: 'TO', value: 'Alex Rivera <alex@example.com>' },
          { label: 'SUBJECT', value: 'A small update on Field Notes' },
          {
            label: 'MESSAGE',
            value: 'The new reading view is ready for a review. Can we find 20 minutes tomorrow?',
          },
        ]}
        status={status}
        onApprove={() => setStatus('approved')}
        onReject={() => setStatus('rejected')}
        testID="ai-approval-card"
      />
      <AIDemoAction
        label="Reset proposal"
        onPress={() => {
          setRequest((value) => value + 1);
          setStatus('pending');
        }}
      />
    </AIToolDemo>
  );
}
