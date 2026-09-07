import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, XCircle, Zap, ExternalLink, Folder } from 'lucide-react';
import { ProcessInfo } from '../types/system';

export const ProcessManager: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ key: keyof ProcessInfo; direction: 'asc' | 'desc' }>({
    key: 'cpu_usage',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcesses = async () => {
    try {
      const data: ProcessInfo[] = await invoke('get_processes');
      setProcesses(data);
    } catch (e) {
      console.error('Failed to fetch processes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid: number, force = false) => {
    const cmd = force ? 'force_kill_process' : 'kill_process';
    try {
      await invoke(cmd, { pid });
      fetchProcesses();
    } catch (e) {
      alert(`Error killing process ${pid}: ${e}`);
    }
  };

  const sortedProcesses = [...processes]
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortBy.key];
      const bVal = b[sortBy.key];
      if (aVal === null || bVal === null) return 0;
      if (aVal < bVal) return sortBy.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (key: keyof ProcessInfo) => {
    setSortBy((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading processes...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Process Manager</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search processes..."
            className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-200" onClick={() => toggleSort('pid')}>PID</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-200" onClick={() => toggleSort('name')}>Name</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-200" onClick={() => toggleSort('cpu_usage')}>CPU %</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-200" onClick={() => toggleSort('memory')}>RAM</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-200" onClick={() => toggleSort('status')}>Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedProcesses.map((p) => (
              <tr key={p.pid} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-zinc-500">{p.pid}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.cpu_usage.toFixed(1)}%</td>
                <td className="px-4 py-3">{(p.memory / 1024 / 1024).toFixed(1)} MB</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 border border-zinc-700">
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleKill(p.pid)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                    title="End Process"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleKill(p.pid, true)}
                    className="p-1.5 text-zinc-400 hover:text-orange-400 transition-colors"
                    title="Force Kill"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
