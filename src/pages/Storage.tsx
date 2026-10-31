import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { homeDir } from '@tauri-apps/api/path';
import {
  Folder, File, ArrowUp, Home, RefreshCw, FolderX, FolderOpen, Copy, ChevronRight, Search, HardDrive, SearchX,
} from 'lucide-react';
import { DiskNode } from '../types/system';
import { Button, EmptyState, IconButton, Input, LoadingRows, Menu, MenuItem, Segmented, useMenu } from '../ui';
import { Page } from '../shell/Page';
import { TopBarActions, useBreadcrumb } from '../shell/TopBarSlot';
import { useHotkeys } from '../hooks/useHotkeys';
import { cx, errorMessage, formatBytes, modKey } from '../lib/format';
import { copyText } from '../lib/clipboard';

const parentOf = (p: string) => {
  const trimmed = p.length > 1 ? p.replace(/\/+$/, '') : p;
  const idx = trimmed.lastIndexOf('/');
  return idx <= 0 ? '/' : trimmed.slice(0, idx);
};
const segmentsOf = (p: string) => {
  const parts = p.split('/').filter(Boolean);
  return [{ name: '/', path: '/' }, ...parts.map((name, i) => ({ name, path: '/' + parts.slice(0, i + 1).join('/') }))];
};

type SortMode = 'size' | 'name';

export const Storage: React.FC = () => {
  const [home, setHome] = useState('/');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<DiskNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('size');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [menuNode, setMenuNode] = useState<DiskNode | null>(null);
  const menu = useMenu();
  const pathRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    homeDir()
      .then((h) => {
        const p = h.replace(/\/+$/, '') || '/';
        setHome(p);
        setCurrentPath(p);
      })
      .catch(() => setCurrentPath('/'));
  }, []);

  const fetchDiskUsage = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      setCurrentNode(await invoke<DiskNode>('get_disk_usage', { path, depth: 1 }));
    } catch (e) {
      setError(errorMessage(e, `Could not read ${path}`));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath) {
      fetchDiskUsage(currentPath);
      setFilter('');
    }
  }, [currentPath, fetchDiskUsage]);

  const segments = currentPath ? segmentsOf(currentPath) : [];
  useBreadcrumb(segments.length > 1 ? [segments[segments.length - 1].name] : []);

  const navigateUp = () => currentPath && currentPath !== '/' && setCurrentPath(parentOf(currentPath));
  const navigateTo = (node: DiskNode) => node.is_dir && setCurrentPath(node.path);

  useHotkeys([
    { combo: 'mod+l', handler: () => (setDraft(currentPath ?? '/'), setEditing(true)) },
    { combo: 'alt+arrowup', handler: navigateUp },
    { combo: 'backspace', handler: navigateUp },
    { combo: 'mod+r', handler: () => currentPath && fetchDiskUsage(currentPath) },
    { combo: '/', handler: () => listRef.current?.parentElement?.querySelector<HTMLInputElement>('input[aria-label="Filter items"]')?.focus() },
  ]);

  useEffect(() => {
    if (editing) pathRef.current?.select();
  }, [editing]);

  const children = useMemo(() => {
    const q = filter.toLowerCase();
    const list = (currentNode?.children ?? []).filter((n) => !q || n.name.toLowerCase().includes(q));
    return list.sort((a, b) => {
      if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
      return sort === 'size' && !a.is_dir ? b.size - a.size : a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }, [currentNode, filter, sort]);

  const largest = useMemo(() => Math.max(1, ...children.filter((c) => !c.is_dir).map((c) => c.size)), [children]);
  const counts = useMemo(() => {
    const all = currentNode?.children ?? [];
    return { dirs: all.filter((c) => c.is_dir).length, files: all.filter((c) => !c.is_dir).length };
  }, [currentNode]);

  const menuItems: MenuItem[] = menuNode
    ? [
        { type: 'label', label: menuNode.name },
        ...(menuNode.is_dir ? [{ label: 'Open folder', icon: FolderOpen, shortcut: '↵', onSelect: () => navigateTo(menuNode) }] : []),
        { label: 'Copy path', icon: Copy, onSelect: () => copyText(menuNode.path, 'Path') },
        { label: 'Copy name', icon: Copy, onSelect: () => copyText(menuNode.name, 'Name') },
      ]
    : [];

  const submitPath = (e: React.FormEvent) => {
    e.preventDefault();
    const p = draft.trim().replace(/^~(?=\/|$)/, home);
    setEditing(false);
    if (p) setCurrentPath(p.startsWith('/') ? p : `/${p}`);
  };

  return (
    <Page fill>
      <TopBarActions>
        <IconButton icon={Home} label="Home folder" onClick={() => setCurrentPath(home)} disabled={currentPath === home} />
        <IconButton icon={RefreshCw} label={`Rescan (${modKey}+R)`} onClick={() => currentPath && fetchDiskUsage(currentPath)} />
      </TopBarActions>

      {/* Location bar */}
      <div className="flex items-center gap-2 mb-3">
        <IconButton icon={ArrowUp} label="Up one level (Alt+↑)" onClick={navigateUp} disabled={!currentPath || currentPath === '/'} />
        {editing ? (
          <form onSubmit={submitPath} className="flex-1 min-w-0">
            <Input
              ref={pathRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
              aria-label="Folder path"
              className="font-mono"
            />
          </form>
        ) : (
          <div
            className="flex-1 min-w-0 flex items-center h-ctl px-1 rounded-md border border-line bg-fg/[0.03] overflow-x-auto"
            onDoubleClick={() => (setDraft(currentPath ?? '/'), setEditing(true))}
            title={`Double-click or press ${modKey}+L to type a path`}
          >
            {segments.map((s, i) => (
              <React.Fragment key={s.path}>
                {i > 1 && <ChevronRight className="w-3 h-3 text-subtle shrink-0" aria-hidden />}
                <button
                  onClick={() => setCurrentPath(s.path)}
                  className={cx(
                    'h-6 px-1.5 rounded text-sm whitespace-nowrap transition-colors duration-fast hover:bg-fg/[0.07]',
                    i === segments.length - 1 ? 'text-fg font-medium' : 'text-muted',
                  )}
                >
                  {i === 0 ? <HardDrive className="w-3.5 h-3.5" aria-label="Root" /> : s.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Input
          icon={Search}
          placeholder="Filter this folder"
          aria-label="Filter items"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onClear={() => setFilter('')}
          hint="/"
          className="w-full sm:w-64"
        />
        <Segmented<SortMode>
          label="Sort items"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'size', label: 'Largest' },
            { value: 'name', label: 'Name' },
          ]}
        />
        {currentNode && !loading && (
          <span className="ml-auto text-xs text-muted tabular">
            {counts.dirs} folders · {counts.files} files · <span className="text-fg">{formatBytes(currentNode.size)}</span> in files
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-surface border border-line rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 h-8 px-4 border-b border-line bg-fg/[0.02] text-2xs font-medium text-subtle shrink-0">
          <span className="flex-1">Name</span>
          <span className="w-[140px] hidden md:block">Share of largest file</span>
          <span className="w-[88px] text-right">Size</span>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto" role="list" aria-busy={loading}>
          {loading || !currentPath ? (
            <LoadingRows label="Scanning folder" />
          ) : error ? (
            <EmptyState
              icon={FolderX}
              tone="danger"
              title="This folder can't be read"
              description={`${error}. It may not exist, or Nexus may lack permission to read it.`}
              action={
                <div className="flex gap-2">
                  <Button onClick={navigateUp} icon={ArrowUp}>Go up</Button>
                  <Button variant="ghost" onClick={() => setCurrentPath(home)} icon={Home}>Home</Button>
                </div>
              }
            />
          ) : children.length === 0 ? (
            filter ? (
              <EmptyState icon={SearchX} title={`Nothing matches “${filter}”`} action={<Button variant="ghost" onClick={() => setFilter('')}>Clear filter</Button>} />
            ) : (
              <EmptyState icon={Folder} title="This folder is empty" />
            )
          ) : (
            children.map((node) => (
              <div
                key={node.path}
                role="listitem"
                tabIndex={0}
                onClick={() => navigateTo(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigateTo(node);
                  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const sib = e.key === 'ArrowDown' ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling;
                    (sib as HTMLElement | null)?.focus();
                  } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                    e.preventDefault();
                    const r = e.currentTarget.getBoundingClientRect();
                    setMenuNode(node);
                    menu.onContextMenu({ preventDefault() {}, clientX: r.left + 120, clientY: r.bottom } as React.MouseEvent);
                  }
                }}
                onContextMenu={(e) => {
                  setMenuNode(node);
                  menu.onContextMenu(e);
                }}
                className={cx(
                  'group flex items-center gap-3 h-row px-4 text-sm border-b border-line last:border-0',
                  'focus-visible:outline-none focus-visible:bg-accent/[0.06] focus-visible:shadow-[inset_2px_0_0_rgb(var(--accent))]',
                  node.is_dir ? 'cursor-pointer hover:bg-fg/[0.04]' : 'hover:bg-fg/[0.02]',
                )}
              >
                {node.is_dir ? (
                  <Folder className="w-4 h-4 text-accent shrink-0" aria-hidden />
                ) : (
                  <File className="w-4 h-4 text-subtle shrink-0" aria-hidden />
                )}
                <span className={cx('flex-1 min-w-0 truncate', node.is_dir ? 'text-fg' : 'text-fg/80')} title={node.path}>
                  {node.name}
                </span>
                <span className="w-[140px] hidden md:block">
                  {!node.is_dir && (
                    <span className="block h-1 rounded-full bg-fg/[0.06] overflow-hidden">
                      <span className="block h-full bg-accent/60 rounded-full origin-left" style={{ transform: `scaleX(${node.size / largest})` }} />
                    </span>
                  )}
                </span>
                <span className="w-[88px] text-right tabular text-muted text-xs">
                  {node.is_dir ? <ChevronRight className="w-3.5 h-3.5 inline text-subtle group-hover:text-muted" aria-label="Folder" /> : formatBytes(node.size)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <Menu at={menu.at} onClose={menu.close} items={menuItems} label="Item actions" />
    </Page>
  );
};
