import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Cpu, SearchX, ArrowRight, ScanSearch, ServerCrash } from 'lucide-react';
import { ProcessInfo } from '../types/system';
import { Button, EmptyState, Input, Kbd, LoadingRows } from '../ui';
import { Page } from '../shell/Page';
import { useUiStore } from '../store/useUiStore';
import { errorMessage, formatBytes, modKey } from '../lib/format';

export const SystemSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [results, setResults] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSubmitted(q);
    try {
      setResults(await invoke<ProcessInfo[]>('search_processes', { query: q }));
    } catch (err) {
      console.error('Search failed:', err);
      setError(errorMessage(err, 'Search failed.'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openInProcesses = useUiStore((s) => s.showProcess);

  return (
    <Page width="narrow" title="System Search" description="Find running processes by name.">
      <form onSubmit={handleSearch} className="flex gap-2 mb-5" role="search">
        <Input
          ref={inputRef}
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => {
            setQuery('');
            setResults([]);
            setSubmitted('');
          }}
          placeholder="e.g. firefox, systemd, kwin"
          aria-label="Search processes"
          className="flex-1"
        />
        <Button type="submit" variant="primary" disabled={!query.trim()} loading={loading}>
          Search
        </Button>
      </form>

      {loading ? (
        <div className="bg-surface border border-line rounded-lg"><LoadingRows rows={4} label="Searching" /></div>
      ) : error ? (
        <EmptyState icon={ServerCrash} tone="danger" title="Search failed" description={error} />
      ) : results.length > 0 ? (
        <>
          <p className="text-xs text-muted mb-2">
            {results.length} result{results.length === 1 ? '' : 's'} for “{submitted}”
          </p>
          <ul className="bg-surface border border-line rounded-lg divide-y divide-line overflow-hidden">
            {results.map((res) => (
              <li key={res.pid}>
                <button
                  onClick={() => openInProcesses(res.name)}
                  className="group w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-fg/[0.03] focus-visible:bg-accent/[0.06] focus-visible:outline-none"
                >
                  <Cpu className="w-4 h-4 text-accent shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{res.name}</p>
                    <p className="text-2xs text-subtle font-mono truncate" title={res.exe_path}>{res.exe_path || 'Path unavailable'}</p>
                  </div>
                  <dl className="hidden sm:grid grid-cols-3 gap-5 text-right text-xs tabular shrink-0">
                    <div><dt className="text-2xs text-subtle">PID</dt><dd className="font-mono">{res.pid}</dd></div>
                    <div><dt className="text-2xs text-subtle">CPU</dt><dd>{res.cpu_usage.toFixed(1)}%</dd></div>
                    <div><dt className="text-2xs text-subtle">Memory</dt><dd>{formatBytes(res.memory)}</dd></div>
                  </dl>
                  <ArrowRight className="w-3.5 h-3.5 text-subtle opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-fast" aria-label="Open in Processes" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : submitted ? (
        <EmptyState icon={SearchX} title={`No processes match “${submitted}”`} description="Process names are matched case-insensitively." />
      ) : (
        <EmptyState
          icon={ScanSearch}
          title="Search running processes"
          description={
            <>
              Press Enter to search. For quick jumps from anywhere, use <Kbd>{modKey}</Kbd> <Kbd>K</Kbd>.
            </>
          }
        />
      )}
    </Page>
  );
};
