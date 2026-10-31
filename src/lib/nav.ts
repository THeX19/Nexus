import { LucideIcon, LayoutGrid, Activity, HardDrive, Network, Search, TerminalSquare, Settings, HelpCircle } from 'lucide-react';
import type { PageId } from '../store/useUiStore';

export interface NavItem { id: PageId; label: string; icon: LucideIcon; hotkey?: string; description: string }
export interface NavGroup { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    label: 'Monitor',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutGrid, hotkey: '1', description: 'Live CPU, memory, disk and uptime' },
      { id: 'processes', label: 'Processes', icon: Activity, hotkey: '2', description: 'Inspect, sort and end running processes' },
      { id: 'network', label: 'Network', icon: Network, hotkey: '3', description: 'Interfaces and connectivity checks' },
    ],
  },
  {
    label: 'Files',
    items: [{ id: 'storage', label: 'Storage', icon: HardDrive, hotkey: '4', description: 'Browse folders by size' }],
  },
  {
    label: 'Tools',
    items: [
      { id: 'search', label: 'System Search', icon: Search, hotkey: '5', description: 'Find processes by name' },
      { id: 'terminal', label: 'Terminal', icon: TerminalSquare, hotkey: '6', description: 'Integrated shell (planned)' },
    ],
  },
];

export const FOOTER_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, hotkey: ',', description: 'Theme, density, accent and motion' },
  { id: 'help', label: 'Shortcuts & Help', icon: HelpCircle, description: 'Keyboard shortcuts and tips' },
];

export const ALL_PAGES: NavItem[] = [...NAV.flatMap((g) => g.items), ...FOOTER_NAV];
export const pageById = (id: PageId) => ALL_PAGES.find((p) => p.id === id)!;
export const groupOf = (id: PageId) => NAV.find((g) => g.items.some((i) => i.id === id))?.label ?? 'Nexus';
