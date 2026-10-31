import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useSystemStore } from '../store/useSystemStore';
import { SystemStats } from '../types/system';
import { errorMessage } from '../lib/format';

/** Subscribes once (at the shell) to the backend's 2s stats stream, so every
 *  screen and the sidebar share one listener instead of re-subscribing per page. */
export function useTelemetry() {
  useEffect(() => {
    let mounted = true;
    let unlisten: (() => void) | null = null;
    const { setStats, setError } = useSystemStore.getState();

    (async () => {
      try {
        const off = await listen<SystemStats>('sys-stats-update', (e) => mounted && setStats(e.payload));
        if (!mounted) off();
        else unlisten = off;
        const initial = await invoke<SystemStats>('get_system_stats');
        if (mounted) setStats(initial);
      } catch (err) {
        console.error('Failed to initialize system telemetry:', err);
        if (mounted) setError(errorMessage(err, 'Failed to initialize system telemetry.'));
      }
    })();

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);
}
