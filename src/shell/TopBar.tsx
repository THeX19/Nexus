import React from 'react';
import { ChevronRight, Search, Moon, Sun, Monitor } from 'lucide-react';
import { useUiStore, ThemePref } from '../store/useUiStore';
import { pageById, groupOf } from '../lib/nav';
import { modKey } from '../lib/format';
import { IconButton, Kbd } from '../ui';
import { TopBarActionsHost, useCrumbs } from './TopBarSlot';

const NEXT_THEME: Record<ThemePref, ThemePref> = { system: 'dark', dark: 'light', light: 'system' };
const THEME_ICON = { system: Monitor, dark: Moon, light: Sun };

export const TopBar: React.FC = () => {
  const page = useUiStore((s) => s.page);
  const theme = useUiStore((s) => s.theme);
  const setPref = useUiStore((s) => s.setPref);
  const openPalette = useUiStore((s) => s.setPaletteOpen);
  const crumbs = useCrumbs();
  const meta = pageById(page);
  const trail = [groupOf(page), meta.label, ...crumbs];

  return (
    <header className="flex items-center gap-3 h-12 px-gutter border-b border-line shrink-0 bg-canvas/80">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 min-w-0 flex-1 text-sm">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-subtle shrink-0" aria-hidden />}
              <span
                aria-current={last ? 'page' : undefined}
                title={c}
                className={
                  last
                    ? 'text-fg font-medium truncate'
                    : i === 0
                      ? 'text-subtle shrink-0 hidden sm:inline'
                      : 'text-muted truncate max-w-[160px]'
                }
              >
                {c}
              </span>
            </React.Fragment>
          );
        })}
      </nav>

      <TopBarActionsHost className="flex items-center gap-1.5 shrink-0" />

      <div className="w-px h-5 bg-line shrink-0" aria-hidden />

      <button
        onClick={() => openPalette(true)}
        className="flex items-center gap-2 h-ctl pl-2.5 pr-1.5 rounded-md border border-line bg-fg/[0.03] text-subtle hover:text-muted hover:border-line-strong transition-colors duration-fast shrink-0"
        aria-label="Open command palette"
        aria-keyshortcuts="Control+K"
      >
        <Search className="w-3.5 h-3.5" aria-hidden />
        <span className="text-sm hidden md:inline pr-6">Search or jump to…</span>
        <span className="flex gap-0.5">
          <Kbd>{modKey}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <IconButton
        icon={THEME_ICON[theme]}
        label={`Theme: ${theme} — click for ${NEXT_THEME[theme]}`}
        onClick={() => setPref('theme', NEXT_THEME[theme])}
      />
    </header>
  );
};
