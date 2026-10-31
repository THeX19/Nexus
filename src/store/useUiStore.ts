import { create } from 'zustand';

export type ThemePref = 'system' | 'dark' | 'light';
export type Density = 'compact' | 'default' | 'comfortable';
export type Accent = 'iris' | 'teal' | 'amber' | 'rose';
export type MotionPref = 'system' | 'reduced' | 'full';
export type PageId = 'dashboard' | 'processes' | 'storage' | 'network' | 'search' | 'terminal' | 'settings' | 'help';

interface Prefs {
  theme: ThemePref;
  density: Density;
  accent: Accent;
  motion: MotionPref;
  sidebarCollapsed: boolean;
}

interface UiState extends Prefs {
  page: PageId;
  paletteOpen: boolean;
  /** One-shot filter handed to the Processes page (from palette / search). */
  processFilter: string | null;
  showProcess: (name: string) => void;
  setPage: (p: PageId) => void;
  setPaletteOpen: (open: boolean) => void;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  toggleSidebar: () => void;
}

const KEY = 'nexus.prefs.v1';
const defaults: Prefs = { theme: 'system', density: 'default', accent: 'iris', motion: 'system', sidebarCollapsed: false };

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

function save(s: Prefs) {
  try {
    const { theme, density, accent, motion, sidebarCollapsed } = s;
    localStorage.setItem(KEY, JSON.stringify({ theme, density, accent, motion, sidebarCollapsed }));
  } catch {
    /* storage unavailable — prefs stay in memory */
  }
}

export const useUiStore = create<UiState>((set, get) => ({
  ...load(),
  page: 'dashboard',
  paletteOpen: false,
  processFilter: null,
  showProcess: (name) => set({ processFilter: name, page: 'processes' }),
  setPage: (page) => set({ page }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setPref: (key, value) => {
    set({ [key]: value } as Partial<UiState>);
    save(get());
  },
  toggleSidebar: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
    save(get());
  },
}));
