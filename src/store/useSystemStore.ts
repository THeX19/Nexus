import { create } from 'zustand';
import { SystemStats } from '../types/system';

interface SystemState {
  stats: SystemStats | null;
  setStats: (stats: SystemStats) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));
