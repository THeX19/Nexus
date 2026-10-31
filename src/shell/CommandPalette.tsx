import React, { useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { LucideIcon, Search, Moon, Sun, Monitor, PanelLeft, Rows, Cpu, CornerDownLeft } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';
import { ALL_PAGES } from '../lib/nav';
import { cx, modKey } from '../lib/format';
import { Kbd, Modal, Spinner } from '../ui';
import { ProcessInfo } from '../types/system';
import { useDebounced } from './TopBarSlot';

interface Command { id: string; group: string; label: string; hint?: string; icon: LucideIcon; keywords?: string; run: () => void }

function score(cmd: Command, q: string) {
  if (!q) return 1;
  const hay = `${cmd.label} ${cmd.keywords ?? ''} ${cmd.group}`.toLowerCase();
  const label = cmd.label.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  // subsequence match ("prc" → "processes")
  let i = 0;
  for (const ch of hay) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
}

export const CommandPalette: React.FC = () => {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [procs, setProcs] = useState<ProcessInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const dq = useDebounced(q.trim(), 160);

  const close = () => setOpen(false);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setProcs([]);
    }
  }, [open]);

  // Live process lookup — only when the palette is open and the query is meaningful.
  useEffect(() => {
    if (!open || dq.length < 2) return setProcs([]);
    let alive = true;
    setSearching(true);
    invoke<ProcessInfo[]>('search_processes', { query: dq })
      .then((r) => alive && setProcs(r.slice(0, 6)))
      .catch(() => alive && setProcs([]))
      .finally(() => alive && setSearching(false));
    return () => {
      alive = false;
    };
  }, [dq, open]);

  const commands = useMemo<Command[]>(() => {
    const { setPage, setPref, toggleSidebar, density } = useUiStore.getState();
    const nav: Command[] = ALL_PAGES.map((p) => ({
      id: `go-${p.id}`,
      group: 'Navigate',
      label: p.label,
      hint: p.hotkey ? `${modKey} ${p.hotkey}` : undefined,
      icon: p.icon,
      keywords: p.description,
      run: () => setPage(p.id),
    }));
    const nextDensity = density === 'compact' ? 'default' : density === 'default' ? 'comfortable' : 'compact';
    const actions: Command[] = [
      { id: 'theme-dark', group: 'Appearance', label: 'Use dark theme', icon: Moon, keywords: 'color scheme', run: () => setPref('theme', 'dark') },
      { id: 'theme-light', group: 'Appearance', label: 'Use light theme', icon: Sun, keywords: 'color scheme', run: () => setPref('theme', 'light') },
      { id: 'theme-system', group: 'Appearance', label: 'Follow system theme', icon: Monitor, keywords: 'auto color scheme', run: () => setPref('theme', 'system') },
      { id: 'density', group: 'Appearance', label: `Switch to ${nextDensity} density`, icon: Rows, keywords: 'spacing compact', run: () => setPref('density', nextDensity) },
      { id: 'sidebar', group: 'View', label: 'Toggle sidebar', hint: `${modKey} B`, icon: PanelLeft, run: toggleSidebar },
    ];
    return [...nav, ...actions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const ranked = commands
      .map((c) => ({ c, s: score(c, ql) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    const procCmds: Command[] = procs.map((p) => ({
      id: `proc-${p.pid}`,
      group: 'Processes',
      label: p.name,
      hint: `PID ${p.pid}`,
      icon: Cpu,
      run: () => useUiStore.getState().showProcess(p.name),
    }));
    return [...ranked, ...procCmds];
  }, [q, commands, procs]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const exec = (c?: Command) => {
    if (!c) return;
    close();
    c.run();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1));
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
    else if (e.key === 'Enter') exec(results[active]);
    else return;
    e.preventDefault();
  };

  let lastGroup = '';
  return (
    <Modal open={open} onClose={close} label="Command palette" position="top" className="max-w-[560px]">
      <div className="flex items-center gap-2.5 px-3.5 h-12 border-b border-line">
        <Search className="w-4 h-4 text-subtle shrink-0" aria-hidden />
        <input
          data-autofocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a command, page, or process name…"
          role="combobox"
          aria-expanded
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `pal-${results[active].id}` : undefined}
          className="flex-1 bg-transparent text-base placeholder:text-subtle focus-visible:outline-none"
        />
        {searching && <Spinner className="w-3.5 h-3.5" />}
        <Kbd>Esc</Kbd>
      </div>
      <div ref={listRef} id="palette-list" role="listbox" className="max-h-[min(380px,55vh)] overflow-y-auto p-1.5">
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            {dq.length >= 2 && searching ? 'Searching processes…' : `No results for “${q}”`}
          </p>
        )}
        {results.map((c, i) => {
          const header = c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          return (
            <React.Fragment key={c.id}>
              {header && <div className="px-2 pt-2 pb-1 text-2xs font-medium text-subtle">{header}</div>}
              <div
                id={`pal-${c.id}`}
                role="option"
                aria-selected={i === active}
                data-index={i}
                onMouseMove={() => setActive(i)}
                onClick={() => exec(c)}
                className={cx(
                  'flex items-center gap-2.5 h-9 px-2 rounded-md text-sm cursor-default',
                  i === active ? 'bg-fg/[0.07] text-fg' : 'text-fg/85',
                )}
              >
                <c.icon className={cx('w-4 h-4 shrink-0', i === active ? 'text-accent' : 'text-subtle')} aria-hidden />
                <span className="truncate flex-1">{c.label}</span>
                {c.hint && <span className="text-2xs text-subtle shrink-0">{c.hint}</span>}
                {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-subtle shrink-0" aria-hidden />}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center gap-4 px-3.5 h-8 border-t border-line text-2xs text-subtle">
        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
        <span className="ml-auto">Type 2+ letters to search processes</span>
      </div>
    </Modal>
  );
};
