import React from 'react';
import { Page } from '../shell/Page';
import { Kbd } from '../ui';
import { modKey } from '../lib/format';
import { ALL_PAGES } from '../lib/nav';

const GROUPS: { title: string; items: [string[], string][] }[] = [
  {
    title: 'General',
    items: [
      [[modKey, 'K'], 'Open command palette'],
      [[modKey, 'B'], 'Toggle sidebar'],
      [['F1'], 'Open this page'],
      [['Esc'], 'Close dialog, menu or palette'],
      [['Shift', 'F10'], 'Open context menu for focused row'],
    ],
  },
  {
    title: 'Navigation',
    items: ALL_PAGES.filter((p) => p.hotkey).map((p) => [[modKey, p.hotkey!], `Go to ${p.label}`] as [string[], string]),
  },
  {
    title: 'Lists',
    items: [
      [['/'], 'Focus the filter field'],
      [['↑', '↓'], 'Move between rows'],
      [[modKey, 'R'], 'Refresh current view'],
      [['Del'], 'End focused process'],
      [['Shift', 'Del'], 'Force kill focused process'],
    ],
  },
  {
    title: 'Storage',
    items: [
      [['Enter'], 'Open focused folder'],
      [['Alt', '↑'], 'Go up one level'],
      [['Backspace'], 'Go up one level'],
      [[modKey, 'L'], 'Type a path'],
    ],
  },
];

export const Help: React.FC = () => (
  <Page width="narrow" title="Shortcuts & Help" description="Nexus is fully keyboard-operable. Right-click rows and cards for contextual actions.">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {GROUPS.map((g) => (
        <section key={g.title} aria-label={g.title}>
          <h2 className="text-xs font-medium text-muted mb-1">{g.title}</h2>
          <dl className="bg-surface border border-line rounded-lg divide-y divide-line">
            {g.items.map(([keys, label]) => (
              <div key={label} className="flex items-center justify-between gap-3 h-row px-3.5 text-sm">
                <dt className="text-fg/90 truncate">{label}</dt>
                <dd className="flex gap-1 shrink-0">
                  {keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  </Page>
);
