import React from 'react';
import { TerminalSquare } from 'lucide-react';
import { EmptyState } from '../ui';
import { Page } from '../shell/Page';

export const Terminal: React.FC = () => (
  <Page>
    <EmptyState
      icon={TerminalSquare}
      title="Terminal is not available yet"
      description="An integrated shell is planned for a future release. Until then, use your desktop's terminal emulator."
      className="min-h-[60vh]"
    />
  </Page>
);
