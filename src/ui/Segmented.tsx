import React, { useRef } from 'react';
import { cx } from '../lib/format';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  title?: string;
}

/** Radio-group semantics with arrow-key navigation and an animated thumb. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (idx + d + options.length) % options.length;
    onChange(options[next].value);
    (ref.current?.children[next + 1] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className="relative inline-grid grid-flow-col auto-cols-fr p-0.5 rounded-md bg-fg/[0.05] border border-line"
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-[5px] bg-raised shadow-[0_1px_2px_rgb(0_0_0/0.2)] border border-line transition-transform duration-base ease-out"
        style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative z-[1] h-[calc(var(--ctl-h)-6px)] px-3 text-xs font-medium rounded-[5px] transition-colors duration-fast inline-flex items-center justify-center gap-1.5',
              active ? 'text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
