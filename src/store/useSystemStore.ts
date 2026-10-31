import { create } from 'zustand';
import { SystemStats } from '../types/system';

interface SystemState {
  stats: SystemStats | null;
  error: string | null;
  setStats: (stats: SystemStats) => void;
  setError: (error: string | null) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  stats: null,
  error: null,
  setStats: (stats) => set({ stats, error: null }),
  setError: (error) => set({ error }),
}));
