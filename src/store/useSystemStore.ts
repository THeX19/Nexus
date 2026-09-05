import { create } from 'zustand';

export interface SystemStats {
  cpu_usage: number;
  ram_used: number;
  ram_total: number;
  ram_usage_pct: number;
  disk_used: number;
  disk_total: number;
  disk_usage_pct: number;
  uptime: number;
}

interface SystemState {
  stats: SystemStats | null;
  setStats: (stats: SystemStats) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));
