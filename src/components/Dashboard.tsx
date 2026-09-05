import React, { useEffect, useState } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { listen } from '@tauri-apps/api/event';

export const Dashboard: React.FC = () => {
  const { stats, setStats } = useSystemStore();

  useEffect(() => {
    const unlisten = listen('sys-stats-update', (event: any) => {
      setStats(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setStats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Initializing system telemetry...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">System Stats</h2>
      <div className="space-y-2 font-mono">
        <p>CPU: {stats.cpu_usage.toFixed(1)}%</p>
        <p>RAM: {stats.ram_used} / {stats.ram_total}</p>
        <p>Disk: {stats.disk_used} / {stats.disk_total}</p>
        <p>Uptime: {stats.uptime}s</p>
      </div>
    </div>
  );
};
