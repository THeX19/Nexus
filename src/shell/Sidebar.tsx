import React, { memo } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NAV, FOOTER_NAV, NavItem } from '../lib/nav';
import { useUiStore } from '../store/useUiStore';
import { useSystemStore } from '../store/useSystemStore';
import { cx, modKey } from '../lib/format';
import { Meter } from '../ui';

const NavButton = memo(({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) => {
  const setPage = useUiStore((s) => s.setPage);
  const tip = item.hotkey ? `${item.label}  (${modKey}+${item.hotkey})` : item.label;
  return (
    <button
      onClick={() => setPage(item.id)}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? tip : undefined}
      className={cx(
        'group relative w-full flex items-center gap-2.5 h-8 rounded-md text-sm transition-colors duration-fast',
        collapsed ? 'justify-center px-0' : 'px-2.5',
        active ? 'bg-fg/[0.07] text-fg font-medium' : 'text-muted hover:text-fg hover:bg-fg/[0.04]',
      )}
    >
      {/* Selection indicator */}
      <span
        aria-hidden
        className={cx(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-accent transition-all duration-base ease-out',
          active ? 'h-4 opacity-100' : 'h-0 opacity-0',
        )}
      />
      <item.icon className={cx('w-4 h-4 shrink-0', active ? 'text-accent' : 'text-subtle group-hover:text-muted')} aria-hidden />
      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
      {!collapsed && item.hotkey && (
        <span className="text-2xs text-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
          {modKey}
          {item.hotkey}
        </span>
      )}
    </button>
  );
});

const SystemPulse: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const stats = useSystemStore((s) => s.stats);
  const error = useSystemStore((s) => s.error);
  const state = error && !stats ? 'offline' : stats ? 'live' : 'connecting';
  const dot = state === 'live' ? 'bg-success' : state === 'offline' ? 'bg-danger' : 'bg-warning animate-pulse';

  if (collapsed) {
    return (
      <div className="grid place-items-center h-8" title={`Telemetry ${state}`}>
        <span className={cx('w-2 h-2 rounded-full', dot)} />
      </div>
    );
  }
  return (
    <div className="px-2.5 py-2 space-y-2 rounded-md bg-fg/[0.03] border border-line">
      <div className="flex items-center gap-2 text-2xs text-muted">
        <span className={cx('w-1.5 h-1.5 rounded-full', dot)} aria-hidden />
        <span className="capitalize">Telemetry {state}</span>
      </div>
      {stats && (
        <div className="space-y-1.5">
          {[
            ['CPU', stats.cpu_usage],
            ['RAM', stats.ram_usage_pct],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center gap-2">
              <span className="w-7 text-2xs text-subtle">{k}</span>
              <Meter value={v as number} thin label={`${k} usage`} />
              <span className="w-9 text-right text-2xs text-muted tabular">{(v as number).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const page = useUiStore((s) => s.page);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Primary"
      className={cx(
        'flex flex-col shrink-0 bg-surface border-r border-line transition-[width] duration-base ease-out overflow-hidden',
        collapsed ? 'w-[52px]' : 'w-[216px]',
      )}
    >
      <div className={cx('flex items-center h-12 shrink-0', collapsed ? 'justify-center' : 'px-3.5 justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <Logo />
            <span className="font-semibold tracking-tight text-[15px]">Nexus</span>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (${modKey}+B)`}
          className="grid place-items-center w-7 h-7 rounded-md text-subtle hover:text-fg hover:bg-fg/[0.06] transition-colors duration-fast"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-4">
        {NAV.map((g) => (
          <div key={g.label} role="group" aria-label={g.label}>
            {collapsed ? (
              <div className="h-px mx-2 my-2 bg-line" aria-hidden />
            ) : (
              <div className="px-2.5 h-6 flex items-center text-2xs font-medium text-subtle">{g.label}</div>
            )}
            <div className="space-y-px">
              {g.items.map((it) => (
                <NavButton key={it.id} item={it} active={page === it.id} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2 py-2 space-y-2 border-t border-line">
        <div className="space-y-px">
          {FOOTER_NAV.map((it) => (
            <NavButton key={it.id} item={it} active={page === it.id} collapsed={collapsed} />
          ))}
        </div>
        <SystemPulse collapsed={collapsed} />
      </div>
    </aside>
  );
};

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={cx('w-5 h-5 text-accent shrink-0', className)} aria-hidden>
    <rect x="1" y="1" width="18" height="18" rx="5" fill="currentColor" opacity="0.14" />
    <path d="M6 14V6l8 8V6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
