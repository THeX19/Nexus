import React, { useState } from 'react';
import { Search, X, File, ExternalLink, Activity } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ProcessInfo } from '../types/system';

export const SystemSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults: ProcessInfo[] = await invoke('search_processes', { query });
      setResults(searchResults);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">System Search</h2>
        <p className="text-zinc-500">Search for processes and system components</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-11 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
          placeholder="Search for a process (e.g. 'chrome', 'system')..."
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-500 animate-pulse">
            Searching system...
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-800 rounded-lg text-blue-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{res.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{res.exe_path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-zinc-500 font-medium">PID</p>
                    <p className="text-xs font-mono text-zinc-300">{res.pid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-zinc-500 font-medium">CPU</p>
                    <p className="text-xs font-mono text-zinc-300">{res.cpu_usage.toFixed(1)}%</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <p>No matching processes found for "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p>Enter a search term to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};
