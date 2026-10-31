import React from 'react';
import { Cpu, MemoryStick, HardDrive, Clock, ServerCrash, LucideIcon, ArrowUpRight } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';
import { useUiStore, PageId } from '../store/useUiStore';
import { formatBytes, formatUptime, formatPct, loadTone, cx } from '../lib/format';
import { Panel, Meter, EmptyState, Skeleton, Badge, SectionLabel } from '../ui';
import { Page } from '../shell/Page';

const Metric: React.FC<{
  label: string;
  icon: LucideIcon;
  value: string;
  detail?: string;
  pct?: number;
  to?: PageId;
}> = ({ label, icon: Icon, value, detail, pct, to }) => {
  const setPage = useUiStore((s) => s.setPage);
  const tone = pct !== undefined ? loadTone(pct) : null;
  const body = (
    <>
      <div className="flex items-center gap-2 text-xs text-muted">
        <Icon className="w-3.5 h-3.5 text-subtle" aria-hidden />
        <span className="flex-1 text-left">{label}</span>
        {to && <ArrowUpRight className="w-3.5 h-3.5 text-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-fast" aria-hidden />}
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-[26px] leading-none font-semibold tracking-tight tabular">{value}</span>
        {pct !== undefined && (
          <span className={cx('text-xs tabular', tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-muted')}>
            {formatPct(pct)}
          </span>
        )}
      </div>
      {detail && <p className="text-xs text-subtle mt-1.5 tabular text-left truncate">{detail}</p>}
      {pct !== undefined && <Meter value={pct} className="mt-3" label={`${label} ${formatPct(pct)}`} />}
    </>
  );
  const cls = 'group bg-surface border border-line rounded-lg p-4 flex flex-col min-w-0';
  return to ? (
    <button onClick={() => setPage(to)} className={cx(cls, 'text-left hover:border-line-strong transition-colors duration-fast')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
};

const CapacityRow: React.FC<{ label: string; used: number; total: number; pct: number }> = ({ label, used, total, pct }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular text-xs text-muted">
        <span className="text-fg">{formatBytes(used)}</span> of {formatBytes(total)} · {formatBytes(Math.max(0, total - used))} free
      </span>
    </div>
    <Meter value={pct} label={`${label} ${formatPct(pct)}`} />
  </div>
);

export const Dashboard: React.FC = () => {
  const stats = useSystemStore((s) => s.stats);
  const error = useSystemStore((s) => s.error);

  if (error && !stats) {
    return (
      <EmptyState
        icon={ServerCrash}
        tone="danger"
        title="System telemetry is unavailable"
        description={<>The backend did not respond: {error}. Nexus will keep listening for updates.</>}
      />
    );
  }

  const high = stats && (stats.cpu_usage >= 90 || stats.ram_usage_pct >= 90 || stats.disk_usage_pct >= 90);

  return (
    <Page
      title="Overview"
      description="Live system telemetry, refreshed every 2 seconds."
      aside={stats && <Badge tone={high ? 'warning' : 'success'} dot>{high ? 'High load' : 'Healthy'}</Badge>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {!stats ? (
          Array.from({ length: 4 }, (_, i) => (
            <Panel key={i} className="space-y-3" aria-busy>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-1.5 w-full" />
            </Panel>
          ))
        ) : (
          <>
            <Metric label="Processor" icon={Cpu} value={formatPct(stats.cpu_usage)} detail="Across all cores" to="processes" />
            <Metric label="Memory" icon={MemoryStick} value={formatBytes(stats.ram_used)} pct={stats.ram_usage_pct} to="processes" />
            <Metric label="Disk" icon={HardDrive} value={formatBytes(stats.disk_used)} pct={stats.disk_usage_pct} to="storage" />
            <Metric label="Uptime" icon={Clock} value={formatUptime(stats.uptime)} detail={`${(stats.uptime / 3600).toFixed(1)} hours since boot`} />
          </>
        )}
      </div>

      {stats && (
        <section className="mt-6" aria-labelledby="cap">
          <SectionLabel id="cap">Capacity</SectionLabel>
          <Panel className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
            <CapacityRow label="Memory" used={stats.ram_used} total={stats.ram_total} pct={stats.ram_usage_pct} />
            <CapacityRow label="Disks (all mounted)" used={stats.disk_used} total={stats.disk_total} pct={stats.disk_usage_pct} />
          </Panel>
        </section>
      )}
    </Page>
  );
};
