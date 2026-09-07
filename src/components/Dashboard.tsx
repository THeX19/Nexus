import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useSystemStore } from '../store/useSystemStore';
import { StatCard } from './StatCard';
import { Cpu, Activity, HardDrive, Clock } from 'lucide-react';
import { SystemStats } from '../types/system';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const Dashboard: React.FC = () => {
  const { stats, setStats } = useSystemStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let unlisten: (() => void) | null = null;

    const initializeTelemetry = async () => {
      try {
        unlisten = await listen('sys-stats-update', (event) => {
          if (!mounted) return;
          setStats(event.payload as SystemStats);
          setError(null);
        });

        const initialStats = await invoke('get_system_stats');
        if (!mounted) return;
        setStats(initialStats as SystemStats);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize system telemetry:', err);
        if (!mounted) return;
        setError(typeof err === 'string' ? err : 'Failed to initialize system telemetry.');
      }
    };

    initializeTelemetry();

    return () => {
      mounted = false;
      if (unlisten) unlisten();
    };
  }, [setStats]);

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
        <p className="text-red-400">System telemetry failed to initialize.</p>
        <p className="text-sm text-zinc-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Initializing system telemetry...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-zinc-400 font-mono">Live Telemetry Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="CPU Usage"
          value={`${stats.cpu_usage.toFixed(1)}%`}
          percentage={stats.cpu_usage}
          icon={Cpu}
        />
        <StatCard
          label="Memory"
          value={formatBytes(stats.ram_used)}
          percentage={stats.ram_usage_pct}
          icon={Activity}
        />
        <StatCard
          label="Disk Usage"
          value={formatBytes(stats.disk_used)}
          percentage={stats.disk_usage_pct}
          icon={HardDrive}
        />
        <StatCard
          label="System Uptime"
          value={`${(stats.uptime / 3600).toFixed(1)}h`}
          icon={Clock}
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Detailed Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">RAM Capacity</span>
              <span className="text-sm font-mono text-zinc-300">{formatBytes(stats.ram_total)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${stats.ram_usage_pct}%` }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Disk Capacity</span>
              <span className="text-sm font-mono text-zinc-300">{formatBytes(stats.disk_total)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${stats.disk_usage_pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
