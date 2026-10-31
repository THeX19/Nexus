import React from 'react';
import { cx } from '../lib/format';

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }> = ({
  checked,
  onChange,
  label,
  id,
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cx(
      'relative w-8 h-[18px] rounded-full border transition-colors duration-base shrink-0',
      checked ? 'bg-accent border-accent' : 'bg-fg/[0.08] border-line',
    )}
  >
    <span
      className={cx(
        'absolute top-[2px] left-[2px] w-3 h-3 rounded-full transition-transform duration-base ease-out',
        checked ? 'translate-x-[14px] bg-accent-fg' : 'bg-muted',
      )}
    />
  </button>
);
