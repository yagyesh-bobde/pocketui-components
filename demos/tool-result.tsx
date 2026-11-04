import { useState } from 'react';
import { ToolResult } from '../ui/tool-result';
import { AIDemoAction, AIToolDemo } from './ai-tool-demo';

export default function ToolResultDemo() {
  const [retry, setRetry] = useState(false);
  return (
    <AIToolDemo
      title={'What happened.\nIn plain sight.'}
      description="Useful summaries up front. The exact returned payload, one tap away."
    >
      <ToolResult
        toolName="notes.search"
        status="running"
        summary="Looking through the notes selected for this demo."
      />
      <ToolResult
        toolName="calendar.find_time"
        status="success"
        summary="Found two open windows tomorrow."
        defaultExpanded
        output={'{\n  "windows": ["09:00", "14:30"],\n  "timezone": "Asia/Kolkata"\n}'}
        testID="ai-tool-result"
      />
      <ToolResult
        toolName="workspace.sync"
        status={retry ? 'running' : 'error'}
        summary={
          retry ? 'The demo retry was requested.' : 'The workspace connection needs attention.'
        }
        output={'{ "code": "CONNECTION_REQUIRED" }'}
        onRetry={() => setRetry(true)}
      />
      {retry && <AIDemoAction label="Restore error example" onPress={() => setRetry(false)} />}
    </AIToolDemo>
  );
}
