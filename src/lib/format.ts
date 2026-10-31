const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const v = bytes / Math.pow(1024, i);
  return `${v.toFixed(i === 0 ? 0 : digits)} ${UNITS[i]}`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const formatPct = (v: number) => `${v.toFixed(1)}%`;

export function errorMessage(e: unknown, fallback = 'Something went wrong.'): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  return fallback;
}

/** Tone for a utilisation percentage — used consistently by meters & badges. */
export function loadTone(pct: number): 'accent' | 'warning' | 'danger' {
  if (pct >= 90) return 'danger';
  if (pct >= 75) return 'warning';
  return 'accent';
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
export const modKey = isMac ? '⌘' : 'Ctrl';
