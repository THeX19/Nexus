import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Search, XCircle, Zap, MoreHorizontal, RefreshCw, Pause, Play, ArrowUp, ArrowDown, Copy, Filter, SearchX, ServerCrash,
} from 'lucide-react';
import { ProcessInfo } from '../types/system';
import { Badge, Button, ConfirmDialog, EmptyState, IconButton, Input, LoadingRows, Menu, MenuItem, useMenu, toast } from '../ui';
import { Page } from '../shell/Page';
import { TopBarActions } from '../shell/TopBarSlot';
import { useUiStore } from '../store/useUiStore';
import { useHotkeys } from '../hooks/useHotkeys';
import { cx, errorMessage, formatBytes, modKey } from '../lib/format';
import { copyText } from '../lib/clipboard';

type SortKey = 'pid' | 'name' | 'cpu_usage' | 'memory' | 'status';
const COLUMNS: { key: SortKey; label: string; className: string; numeric?: boolean }[] = [
  { key: 'pid', label: 'PID', className: 'w-[84px]', numeric: true },
  { key: 'name', label: 'Name', className: 'flex-1 min-w-0' },
  { key: 'cpu_usage', label: 'CPU', className: 'w-[84px]', numeric: true },
  { key: 'memory', label: 'Memory', className: 'w-[100px]', numeric: true },
  { key: 'status', label: 'Status', className: 'w-[104px] hidden md:block' },
];

const statusTone = (s: string) => {
  const l = s.toLowerCase();
  if (l.includes('run')) return 'success' as const;
  if (l.includes('zombie') || l.includes('dead')) return 'danger' as const;
  if (l.includes('stop')) return 'warning' as const;
  return 'neutral' as const;
};

type KillRequest = { proc: ProcessInfo; force: boolean } | null;

const Row = memo(
  ({ p, onMenu, onKill }: { p: ProcessInfo; onMenu: (e: React.MouseEvent | { clientX: number; clientY: number }, p: ProcessInfo) => void; onKill: (r: KillRequest) => void }) => (
    <div
      role="row"
      tabIndex={0}
      onContextMenu={(e) => {
        e.preventDefault();
        onMenu(e, p);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Delete') onKill({ proc: p, force: e.shiftKey });
        else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          onMenu({ clientX: r.left + 120, clientY: r.bottom }, p);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const sib = e.key === 'ArrowDown' ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling;
          (sib as HTMLElement | null)?.focus();
        }
      }}
      className="group flex items-center gap-3 h-row px-4 text-sm border-b border-line last:border-0 hover:bg-fg/[0.03] focus-visible:bg-accent/[0.06] focus-visible:outline-none focus-visible:shadow-[inset_2px_0_0_rgb(var(--accent))]"
    >
      <span role="cell" className="w-[84px] font-mono text-xs text-subtle tabular">{p.pid}</span>
      <span role="cell" className="flex-1 min-w-0 truncate font-medium" title={p.exe_path || p.name}>{p.name}</span>
      <span role="cell" className={cx('w-[84px] text-right tabular', p.cpu_usage >= 50 ? 'text-warning' : 'text-muted')}>
        {p.cpu_usage.toFixed(1)}%
      </span>
      <span role="cell" className="w-[100px] text-right tabular text-muted">{formatBytes(p.memory)}</span>
      <span role="cell" className="w-[104px] hidden md:block pl-3">
        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
      </span>
      <span role="cell" className="w-[88px] flex justify-end gap-0.5 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-fast">
        <IconButton icon={XCircle} label={`End ${p.name}`} tone="danger" tabIndex={-1} onClick={() => onKill({ proc: p, force: false })} />
        <IconButton icon={Zap} label={`Force kill ${p.name}`} tone="warning" tabIndex={-1} onClick={() => onKill({ proc: p, force: true })} />
        <IconButton
          icon={MoreHorizontal}
          label="More actions"
          tabIndex={-1}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            onMenu({ clientX: r.right - 200, clientY: r.bottom + 4 }, p);
          }}
        />
      </span>
    </div>
  ),
);

export const Processes: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'cpu_usage', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kill, setKill] = useState<KillRequest>(null);
  const [menuProc, setMenuProc] = useState<ProcessInfo | null>(null);
  const menu = useMenu();
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchProcesses = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const data = await invoke<ProcessInfo[]>('get_processes');
      setProcesses(data);
      setLoadError(null);
    } catch (e) {
      console.error('Failed to fetch processes:', e);
      setLoadError(errorMessage(e, 'Failed to fetch processes.'));
    } finally {
      setIsLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
    if (paused) return;
    // Skip polling while the window is hidden to save CPU.
    const interval = setInterval(() => !document.hidden && fetchProcesses(), 3000);
    return () => clearInterval(interval);
  }, [fetchProcesses, paused]);

  const processFilter = useUiStore((s) => s.processFilter);
  useEffect(() => {
    if (processFilter === null) return;
    setSearchTerm(processFilter);
    useUiStore.setState({ processFilter: null });
  }, [processFilter]);

  useHotkeys([
    { combo: '/', handler: () => searchRef.current?.focus() },
    { combo: 'mod+f', handler: () => searchRef.current?.focus() },
    { combo: 'mod+r', handler: () => fetchProcesses(true) },
  ]);

  const confirmKill = async () => {
    if (!kill) return;
    const { proc, force } = kill;
    setKill(null);
    try {
      await invoke(force ? 'force_kill_process' : 'kill_process', { pid: proc.pid });
      toast.success(force ? `Force-killed ${proc.name}` : `Sent end signal to ${proc.name}`, `PID ${proc.pid}`);
      fetchProcesses();
    } catch (e) {
      toast.error(`Could not end ${proc.name} (PID ${proc.pid})`, `${errorMessage(e)} — you may need elevated permissions.`);
    }
  };

  const sortedProcesses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return processes
      .filter((p) => !q || p.name.toLowerCase().includes(q) || String(p.pid).startsWith(q))
      .sort((a, b) => {
        const aVal = a[sortBy.key];
        const bVal = b[sortBy.key];
        if (aVal < bVal) return sortBy.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processes, searchTerm, sortBy]);

  const toggleSort = (key: SortKey) =>
    setSortBy((prev) => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : key === 'name' || key === 'status' ? 'asc' : 'desc',
    }));

  const openMenu = useCallback((e: { clientX: number; clientY: number }, p: ProcessInfo) => {
    setMenuProc(p);
    menu.onContextMenu({ preventDefault() {}, clientX: e.clientX, clientY: e.clientY } as React.MouseEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems: MenuItem[] = menuProc
    ? [
        { type: 'label', label: `${menuProc.name} · ${menuProc.pid}` },
        { label: 'End process', icon: XCircle, shortcut: 'Del', tone: 'danger', onSelect: () => setKill({ proc: menuProc, force: false }) },
        { label: 'Force kill', icon: Zap, shortcut: '⇧Del', tone: 'danger', onSelect: () => setKill({ proc: menuProc, force: true }) },
        { type: 'separator' },
        { label: 'Copy PID', icon: Copy, onSelect: () => copyText(String(menuProc.pid), 'PID') },
        { label: 'Copy name', icon: Copy, onSelect: () => copyText(menuProc.name, 'Name') },
        { label: 'Copy executable path', icon: Copy, disabled: !menuProc.exe_path, onSelect: () => copyText(menuProc.exe_path, 'Path') },
        { type: 'separator' },
        { label: 'Filter by this name', icon: Filter, onSelect: () => setSearchTerm(menuProc.name) },
      ]
    : [];

  const totalCpu = useMemo(() => processes.reduce((s, p) => s + p.cpu_usage, 0), [processes]);

  return (
    <Page fill>
      <TopBarActions>
        <IconButton
          icon={paused ? Play : Pause}
          label={paused ? 'Resume live updates' : 'Pause live updates'}
          active={paused}
          onClick={() => setPaused((v) => !v)}
        />
        <IconButton
          icon={RefreshCw}
          label={`Refresh (${modKey}+R)`}
          onClick={() => fetchProcesses(true)}
          className={refreshing ? '[&_svg]:animate-spin' : undefined}
        />
      </TopBarActions>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Input
          ref={searchRef}
          icon={Search}
          placeholder="Filter by name or PID"
          aria-label="Filter processes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
          hint="/"
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-3 text-xs text-muted tabular ml-auto">
          <span>
            <span className="text-fg">{sortedProcesses.length}</span>
            {searchTerm && ` of ${processes.length}`} processes
          </span>
          <span className="w-px h-3 bg-line" aria-hidden />
          <span>Σ CPU {totalCpu.toFixed(0)}%</span>
          {paused && <Badge tone="warning">Paused</Badge>}
        </div>
      </div>

      <div role="table" aria-label="Processes" aria-rowcount={sortedProcesses.length} className="flex-1 min-h-0 flex flex-col bg-surface border border-line rounded-lg overflow-hidden">
        <div role="row" className="flex items-center gap-3 h-8 px-4 border-b border-line bg-fg/[0.02] text-2xs font-medium text-subtle shrink-0">
          {COLUMNS.map((c) => {
            const active = sortBy.key === c.key;
            const Arrow = sortBy.direction === 'asc' ? ArrowUp : ArrowDown;
            return (
              <div
                key={c.key}
                role="columnheader"
                aria-sort={active ? (sortBy.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                className={cx(c.className, c.key === 'status' && 'pl-3')}
              >
                <button
                  onClick={() => toggleSort(c.key)}
                  className={cx('inline-flex items-center gap-1 hover:text-fg transition-colors duration-fast w-full', c.numeric && c.key !== 'pid' && 'justify-end', active && 'text-fg')}
                >
                  {c.label}
                  <Arrow className={cx('w-3 h-3', !active && 'invisible')} aria-hidden />
                </button>
              </div>
            );
          })}
          <div className="w-[88px] text-right" role="columnheader">
            <span className="sr-only">Actions</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" role="rowgroup">
          {isLoading ? (
            <LoadingRows label="Loading processes" />
          ) : loadError && processes.length === 0 ? (
            <EmptyState
              icon={ServerCrash}
              tone="danger"
              title="Could not read the process list"
              description={loadError}
              action={<Button icon={RefreshCw} onClick={() => fetchProcesses(true)}>Try again</Button>}
            />
          ) : sortedProcesses.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={`No processes match “${searchTerm}”`}
              description="Try a shorter name or a PID."
              action={<Button variant="ghost" onClick={() => setSearchTerm('')}>Clear filter</Button>}
            />
          ) : (
            sortedProcesses.map((p) => <Row key={p.pid} p={p} onMenu={openMenu} onKill={setKill} />)
          )}
        </div>
      </div>

      <p className="mt-2 text-2xs text-subtle hidden sm:block">
        Tip: right-click a row for more actions. Focus a row and press Del to end it, ⇧Del to force kill.
      </p>

      <Menu at={menu.at} onClose={menu.close} items={menuItems} label="Process actions" />
      <ConfirmDialog
        open={!!kill}
        title={kill?.force ? 'Force kill process?' : 'End process?'}
        description={
          kill && (
            <>
              <span className="text-fg font-medium break-all">{kill.proc.name}</span> (PID {kill.proc.pid}){' '}
              {kill.force
                ? 'will be terminated immediately (SIGKILL). Unsaved work in this process will be lost.'
                : 'will be asked to exit. Unsaved work may be lost.'}
            </>
          )
        }
        confirmLabel={kill?.force ? 'Force kill' : 'End process'}
        onConfirm={confirmKill}
        onCancel={() => setKill(null)}
      />
    </Page>
  );
};
