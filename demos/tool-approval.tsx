import { useState } from 'react';
import { ToolApproval, type ToolApprovalStatus } from '../ui/tool-approval';
import { AIDemoAction, AIToolDemo } from './ai-tool-demo';

export default function ToolApprovalDemo() {
  const [status, setStatus] = useState<ToolApprovalStatus>('pending');
  const [request, setRequest] = useState(1);
  return (
    <AIToolDemo
      title={'Your call.\nEvery time.'}
      description="An explicit pause before a proposed tool action. The user decides what happens next."
    >
      <ToolApproval
        requestId={`calendar-${request}`}
        toolName="calendar.create_event"
        title="Add a quiet hour?"
        description="Create a Focus time event tomorrow from 9:00 to 10:00. Nothing is added until your app handles approval."
        status={status}
        onApprove={() => setStatus('approved')}
        onReject={() => setStatus('rejected')}
        testID="ai-tool-approval"
      />
      <AIDemoAction
        label="Try another request"
        onPress={() => {
          setRequest((value) => value + 1);
          setStatus('pending');
        }}
      />
      <ToolApproval
        requestId="already-approved"
        toolName="notes.read"
        title="Read the selected note"
        description="Only the note you selected is included in this demo."
        status="approved"
        onApprove={() => {}}
        onReject={() => {}}
      />
    </AIToolDemo>
  );
}
