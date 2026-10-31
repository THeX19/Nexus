import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cx, loadTone } from '../lib/format';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={cx('animate-spin text-muted', className ?? 'w-4 h-4')} aria-hidden />
);

export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <kbd
    className={cx(
      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-sm border border-line bg-fg/[0.04]',
      'font-sans text-2xs text-muted leading-none',
      className,
    )}
  >
    {children}
  </kbd>
);

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
const toneText: Record<Tone, string> = {
  neutral: 'text-muted',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};
const toneBg: Record<Tone, string> = {
  neutral: 'bg-fg/[0.06]',
  accent: 'bg-accent/[0.12]',
  success: 'bg-success/[0.12]',
  warning: 'bg-warning/[0.12]',
  danger: 'bg-danger/[0.12]',
};

export const Badge: React.FC<{ tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  dot,
  children,
  className,
}) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 h-5 px-1.5 rounded-sm text-2xs font-medium capitalize max-w-full',
      toneText[tone],
      toneBg[tone],
      className,
    )}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden />}
    <span className="truncate">{children}</span>
  </span>
);

const meterFill = { accent: 'bg-accent', warning: 'bg-warning', danger: 'bg-danger' };

export const Meter: React.FC<{ value: number; label?: string; className?: string; thin?: boolean }> = ({
  value,
  label,
  className,
  thin,
}) => {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cx('w-full rounded-full bg-fg/[0.07] overflow-hidden', thin ? 'h-1' : 'h-1.5', className)}
    >
      <div
        className={cx('h-full rounded-full origin-left transition-transform duration-base ease-out', meterFill[loadTone(v)])}
        style={{ transform: `scaleX(${v / 100})` }}
      />
    </div>
  );
};

export const Panel: React.FC<React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }> = ({
  padded = true,
  className,
  ...rest
}) => <div className={cx('bg-surface border border-line rounded-lg', padded && 'p-4', className)} {...rest} />;

export const SectionLabel: React.FC<{ children: React.ReactNode; action?: React.ReactNode; id?: string }> = ({
  children,
  action,
  id,
}) => (
  <div className="flex items-center justify-between h-7 mb-2">
    <h3 id={id} className="text-xs font-medium text-muted">
      {children}
    </h3>
    {action}
  </div>
);

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  tone?: 'neutral' | 'danger';
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, description, tone = 'neutral', action, className }) => (
  <div
    role={tone === 'danger' ? 'alert' : undefined}
    className={cx('flex flex-col items-center justify-center text-center gap-3 py-16 px-6 animate-fade-in', className)}
  >
    <div
      className={cx(
        'grid place-items-center w-10 h-10 rounded-lg border border-line',
        tone === 'danger' ? 'text-danger bg-danger/[0.08]' : 'text-subtle bg-fg/[0.03]',
      )}
    >
      <Icon className="w-5 h-5" aria-hidden />
    </div>
    <div className="space-y-1 max-w-sm">
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="text-xs text-muted break-words selectable">{description}</p>}
    </div>
    {action}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('rounded bg-fg/[0.06] animate-pulse', className)} aria-hidden />
);

export const LoadingRows: React.FC<{ rows?: number; label?: string }> = ({ rows = 8, label = 'Loading' }) => (
  <div role="status" aria-label={label} className="divide-y divide-line">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 h-row px-4">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 flex-1 max-w-[220px]" />
        <Skeleton className="h-2.5 w-16 ml-auto" />
      </div>
    ))}
  </div>
);
