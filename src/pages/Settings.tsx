import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useUiStore, Accent } from '../store/useUiStore';
import { Page } from '../shell/Page';
import { Segmented, Switch, Button } from '../ui';
import { cx, modKey } from '../lib/format';

const Row: React.FC<{ title: string; description: string; children: React.ReactNode; htmlFor?: string }> = ({ title, description, children, htmlFor }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 py-4 border-b border-line last:border-0">
    <div className="flex-1 min-w-0">
      <label htmlFor={htmlFor} className="text-sm font-medium block">{title}</label>
      <p className="text-xs text-muted mt-0.5">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const ACCENTS: { value: Accent; label: string; swatch: string }[] = [
  { value: 'iris', label: 'Iris', swatch: 'rgb(129 140 248)' },
  { value: 'teal', label: 'Teal', swatch: 'rgb(45 196 180)' },
  { value: 'amber', label: 'Amber', swatch: 'rgb(236 170 70)' },
  { value: 'rose', label: 'Rose', swatch: 'rgb(236 110 140)' },
];

export const Settings: React.FC = () => {
  const s = useUiStore();
  return (
    <Page width="narrow" title="Settings" description="Preferences are stored locally and apply instantly.">
      <section aria-labelledby="appearance" className="mb-8">
        <h2 id="appearance" className="text-xs font-medium text-muted mb-1">Appearance</h2>
        <div className="bg-surface border border-line rounded-lg px-4">
          <Row title="Theme" description="System follows your desktop's light/dark preference (KDE, GNOME, XFCE portals).">
            <Segmented
              label="Theme"
              value={s.theme}
              onChange={(v) => s.setPref('theme', v)}
              options={[
                { value: 'system', label: <><Monitor className="w-3.5 h-3.5" />System</> },
                { value: 'dark', label: <><Moon className="w-3.5 h-3.5" />Dark</> },
                { value: 'light', label: <><Sun className="w-3.5 h-3.5" />Light</> },
              ]}
            />
          </Row>
          <Row title="Accent color" description="Used for selection, focus rings and highlights.">
            <div role="radiogroup" aria-label="Accent color" className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  role="radio"
                  aria-checked={s.accent === a.value}
                  aria-label={a.label}
                  title={a.label}
                  onClick={() => s.setPref('accent', a.value)}
                  className={cx(
                    'w-6 h-6 rounded-full grid place-items-center transition-shadow duration-fast',
                    s.accent === a.value ? 'ring-2 ring-offset-2 ring-offset-surface' : 'hover:ring-1 ring-offset-1 ring-offset-surface ring-line-strong',
                  )}
                  style={{ background: a.swatch, ['--tw-ring-color' as string]: s.accent === a.value ? a.swatch : undefined }}
                />
              ))}
            </div>
          </Row>
          <Row title="Interface density" description="Controls row height, control size and page gutters.">
            <Segmented
              label="Interface density"
              value={s.density}
              onChange={(v) => s.setPref('density', v)}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'default', label: 'Default' },
                { value: 'comfortable', label: 'Roomy' },
              ]}
            />
          </Row>
          <Row title="Motion" description="System respects the desktop's reduce-motion setting.">
            <Segmented
              label="Motion"
              value={s.motion}
              onChange={(v) => s.setPref('motion', v)}
              options={[
                { value: 'system', label: 'System' },
                { value: 'reduced', label: 'Reduced' },
                { value: 'full', label: 'Full' },
              ]}
            />
          </Row>
        </div>
      </section>

      <section aria-labelledby="layout" className="mb-8">
        <h2 id="layout" className="text-xs font-medium text-muted mb-1">Layout</h2>
        <div className="bg-surface border border-line rounded-lg px-4">
          <Row title="Collapsed sidebar" description={`Show icons only. Toggle anytime with ${modKey}+B.`} htmlFor="sb">
            <Switch id="sb" label="Collapsed sidebar" checked={s.sidebarCollapsed} onChange={s.toggleSidebar} />
          </Row>
        </div>
      </section>

      <Button
        variant="ghost"
        onClick={() => {
          s.setPref('theme', 'system');
          s.setPref('accent', 'iris');
          s.setPref('density', 'default');
          s.setPref('motion', 'system');
          if (s.sidebarCollapsed) s.toggleSidebar();
        }}
      >
        Reset to defaults
      </Button>
    </Page>
  );
};
