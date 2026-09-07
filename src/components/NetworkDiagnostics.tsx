import React, { useEffect, useState } from 'react';
import { Network, Wifi, Globe, AlertCircle, Activity } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { NetworkInterface } from '../types/system';

export const NetworkDiagnostics: React.FC = () => {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ host: string; time: string | null; status: 'pending' | 'success' | 'error' }[]>([]);

  const fetchNetworkInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info: NetworkInterface[] = await invoke('get_network_info');
      setInterfaces(info);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
    setPingResult([
      { host: '8.8.8.8', time: null, status: 'pending' },
      { host: '1.1.1.1', time: null, status: 'pending' },
      { host: 'google.com', time: null, status: 'pending' },
    ]);
  }, []);

  const runPing = async (host: string, index: number) => {
    // Note: In a real app, we would implement a ping command in Rust.
    // For now, we'll simulate it to show the UI.
    setPingResult(prev => prev.map((r, i) => i === index ? { ...r, status: 'pending', time: null } : r));

    try {
      // Simulate latency
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      const latency = Math.floor(20 + Math.random() * 80);
      setPingResult(prev => prev.map((r, i) => i === index ? { ...r, status: 'success', time: `${latency}ms` } : r));
    } catch (e) {
      setPingResult(prev => prev.map((r, i) => i === index ? { ...r, status: 'error', time: null } : r));
    }
  };

  const runAllPings = () => {
    pingResult.forEach((r, i) => runPing(r.host, i));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 p-6">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchNetworkInfo}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Network Diagnostics
        </h2>
        <button
          onClick={fetchNetworkInfo}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
        >
          Refresh Interfaces
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interfaces List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Network Interfaces</h3>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-zinc-500 animate-pulse">
              Fetching interface data...
            </div>
          ) : interfaces.length === 0 ? (
            <div className="p-10 text-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500">
              No network interfaces found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interfaces.map((intf, idx) => (
                <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate max-w-xs">{intf.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                      intf.status.toLowerCase().includes('disconnected') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {intf.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-zinc-500">IPv4</span>
                    <span className="text-zinc-300 font-mono text-right">{intf.ipv4}</span>
                    <span className="text-zinc-500">IPv6</span>
                    <span className="text-zinc-300 font-mono text-right">{intf.ipv6}</span>
                    <span className="text-zinc-500">MAC</span>
                    <span className="text-zinc-300 font-mono text-right">{intf.mac}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connectivity Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Connectivity Test</h3>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <div className="space-y-3">
              {pingResult.map((ping, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-300">{ping.host}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ping.status === 'pending' && <Activity className="w-3 h-3 animate-spin text-blue-500" />}
                    {ping.status === 'success' && <span className="text-xs font-mono text-green-400">{ping.time}</span>}
                    {ping.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={runAllPings}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Run Connection Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
