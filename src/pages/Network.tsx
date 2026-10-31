import React, { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Globe, RefreshCw, WifiOff, CheckCircle2, AlertCircle, Copy, Radio, Cable, Wifi, Router } from 'lucide-react';
import { NetworkInterface } from '../types/system';
import { Badge, Button, EmptyState, IconButton, Panel, SectionLabel, Skeleton, Spinner, Menu, useMenu, MenuItem } from '../ui';
import { Page } from '../shell/Page';
import { TopBarActions } from '../shell/TopBarSlot';
import { useHotkeys } from '../hooks/useHotkeys';
import { cx, errorMessage, modKey } from '../lib/format';
import { copyText } from '../lib/clipboard';

type PingState = { host: string; time: string | null; status: 'idle' | 'pending' | 'success' | 'error' };

const ifaceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('wireless') || n.includes('wlan') || n.includes('wl')) return Wifi;
  if (n.includes('loopback') || n === 'lo') return Router;
  return Cable;
};
const isDown = (status: string) => /disconnected|down/i.test(status);

export const Network: React.FC = () => {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<PingState[]>([
    { host: '8.8.8.8', time: null, status: 'idle' },
    { host: '1.1.1.1', time: null, status: 'idle' },
    { host: 'google.com', time: null, status: 'idle' },
  ]);
  const [menuIntf, setMenuIntf] = useState<NetworkInterface | null>(null);
  const menu = useMenu();

  const fetchNetworkInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInterfaces(await invoke<NetworkInterface[]>('get_network_info'));
    } catch (e) {
      setError(errorMessage(e, 'Could not query network interfaces.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworkInfo();
  }, [fetchNetworkInfo]);

  const runPing = async (index: number) => {
    // Note: In a real app, we would implement a ping command in Rust.
    // For now, we'll simulate it to show the UI.
    setPingResult((prev) => prev.map((r, i) => (i === index ? { ...r, status: 'pending', time: null } : r)));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
      const latency = Math.floor(20 + Math.random() * 80);
      setPingResult((prev) => prev.map((r, i) => (i === index ? { ...r, status: 'success', time: `${latency} ms` } : r)));
    } catch {
      setPingResult((prev) => prev.map((r, i) => (i === index ? { ...r, status: 'error', time: null } : r)));
    }
  };
  const runAllPings = () => pingResult.forEach((_, i) => runPing(i));
  const testing = pingResult.some((p) => p.status === 'pending');

  useHotkeys([{ combo: 'mod+r', handler: fetchNetworkInfo }]);

  const menuItems: MenuItem[] = menuIntf
    ? [
        { type: 'label', label: menuIntf.name },
        { label: 'Copy IPv4 address', icon: Copy, disabled: menuIntf.ipv4 === 'N/A', onSelect: () => copyText(menuIntf.ipv4, 'IPv4 address') },
        { label: 'Copy IPv6 address', icon: Copy, disabled: menuIntf.ipv6 === 'N/A', onSelect: () => copyText(menuIntf.ipv6, 'IPv6 address') },
        { label: 'Copy MAC address', icon: Copy, disabled: menuIntf.mac === 'N/A', onSelect: () => copyText(menuIntf.mac, 'MAC address') },
      ]
    : [];

  return (
    <Page>
      <TopBarActions>
        <IconButton icon={RefreshCw} label={`Refresh interfaces (${modKey}+R)`} onClick={fetchNetworkInfo} className={loading ? '[&_svg]:animate-spin' : undefined} />
      </TopBarActions>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <section aria-labelledby="ifaces">
          <SectionLabel id="ifaces" action={!loading && !error && <span className="text-2xs text-subtle tabular">{interfaces.length} found</span>}>
            Interfaces
          </SectionLabel>
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <Panel key={i} className="space-y-3">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-2.5 w-3/4" />
                </Panel>
              ))}
            </div>
          ) : error ? (
            <Panel padded={false}>
              <EmptyState
                icon={WifiOff}
                tone="danger"
                title="Network information is unavailable"
                description={error}
                action={<Button icon={RefreshCw} onClick={fetchNetworkInfo}>Try again</Button>}
              />
            </Panel>
          ) : interfaces.length === 0 ? (
            <Panel padded={false}>
              <EmptyState icon={WifiOff} title="No network interfaces found" description="The system did not report any adapters." />
            </Panel>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {interfaces.map((intf, idx) => {
                const Icon = ifaceIcon(intf.name);
                const down = isDown(intf.status);
                return (
                  <Panel
                    key={idx}
                    className="min-w-0"
                    onContextMenu={(e) => {
                      setMenuIntf(intf);
                      menu.onContextMenu(e);
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <Icon className={cx('w-4 h-4 shrink-0', down ? 'text-subtle' : 'text-accent')} aria-hidden />
                      <span className="text-sm font-medium truncate flex-1" title={intf.name}>{intf.name}</span>
                      <Badge tone={down ? 'danger' : intf.status === 'Unknown' ? 'neutral' : 'success'} dot>
                        {intf.status}
                      </Badge>
                      <IconButton
                        icon={Copy}
                        label="Copy addresses"
                        className="w-6 h-6"
                        onClick={(e) => {
                          setMenuIntf(intf);
                          const r = e.currentTarget.getBoundingClientRect();
                          menu.onContextMenu({ preventDefault() {}, clientX: r.right - 200, clientY: r.bottom + 4 } as React.MouseEvent);
                        }}
                      />
                    </div>
                    <dl className="grid grid-cols-[48px_1fr] gap-x-3 gap-y-1.5 text-xs">
                      {(
                        [
                          ['IPv4', intf.ipv4],
                          ['IPv6', intf.ipv6],
                          ['MAC', intf.mac],
                        ] as const
                      ).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-subtle">{k}</dt>
                          <dd className={cx('font-mono truncate selectable', v === 'N/A' ? 'text-subtle' : 'text-fg/90')} title={v}>
                            {v === 'N/A' ? '—' : v}
                          </dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  </Panel>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="conn">
          <SectionLabel id="conn">Connectivity</SectionLabel>
          <Panel padded={false}>
            <ul className="divide-y divide-line">
              {pingResult.map((ping, idx) => (
                <li key={ping.host} className="flex items-center gap-2.5 h-row px-3.5">
                  <Globe className="w-3.5 h-3.5 text-subtle shrink-0" aria-hidden />
                  <span className="text-sm flex-1 truncate font-mono">{ping.host}</span>
                  <span className="flex items-center gap-1.5 text-xs tabular" aria-live="polite">
                    {ping.status === 'idle' && <span className="text-subtle">Not tested</span>}
                    {ping.status === 'pending' && <Spinner className="w-3.5 h-3.5 text-accent" />}
                    {ping.status === 'success' && (
                      <>
                        <span className="text-success">{ping.time}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-label="Reachable" />
                      </>
                    )}
                    {ping.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-danger" aria-label="Unreachable" />}
                  </span>
                </li>
              ))}
            </ul>
            <div className="p-3 border-t border-line">
              <Button variant="primary" icon={Radio} className="w-full" onClick={runAllPings} loading={testing}>
                {testing ? 'Testing…' : 'Run connection test'}
              </Button>
              <p className="mt-2 text-2xs text-subtle leading-relaxed">
                Latency values are simulated until a native ping command is added to the backend.
              </p>
            </div>
          </Panel>
        </section>
      </div>
      <Menu at={menu.at} onClose={menu.close} items={menuItems} label="Interface actions" />
    </Page>
  );
};
