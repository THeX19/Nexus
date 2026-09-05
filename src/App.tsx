import React, { useState } from 'react';
import { LayoutDashboard, Activity, HardDrive, Network, Terminal, Search, Settings, HelpCircle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProcessManager } from './components/ProcessManager';
import { StorageAnalyzer } from './components/StorageAnalyzer';
import { NetworkDiagnostics } from './components/NetworkDiagnostics';
import { SystemSearch } from './components/SystemSearch';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'processes', label: 'Processes', icon: Activity },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tighter text-white">NEXUS</h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">System Command Center</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-mono">Local Session Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'processes' && <ProcessManager />}
        {activeTab === 'storage' && <StorageAnalyzer />}
        {activeTab === 'network' && <NetworkDiagnostics />}
        {activeTab === 'search' && <SystemSearch />}
        {activeTab !== 'dashboard' && activeTab !== 'processes' && activeTab !== 'storage' && activeTab !== 'network' && activeTab !== 'search' && (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <p className="text-xl font-medium">{navItems.find(i => i.id === activeTab)?.label} is under construction</p>
              <p className="text-sm opacity-60">This module will be implemented in the next phase.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
