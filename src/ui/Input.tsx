import React, { forwardRef } from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cx } from '../lib/format';
import { Kbd } from './primitives';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  onClear?: () => void;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon: Icon, onClear, hint, className, value, ...rest }, ref) => (
    <div className={cx('relative flex items-center', className)}>
      {Icon && <Icon className="absolute left-2.5 w-3.5 h-3.5 text-subtle pointer-events-none" aria-hidden />}
      <input
        ref={ref}
        value={value}
        className={cx(
          'w-full h-ctl rounded-md bg-fg/[0.04] border border-line text-sm text-fg placeholder:text-subtle',
          'transition-[border-color,background-color,box-shadow] duration-fast',
          'hover:border-line-strong focus:border-accent/70 focus:bg-transparent focus:ring-2 focus:ring-accent/20 focus-visible:outline-none',
          Icon ? 'pl-8' : 'pl-2.5',
          onClear && value ? 'pr-7' : hint ? 'pr-9' : 'pr-2.5',
        )}
        {...rest}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="absolute right-1.5 grid place-items-center w-5 h-5 rounded text-subtle hover:text-fg hover:bg-fg/[0.08]"
        >
          <X className="w-3 h-3" />
        </button>
      ) : (
        hint && <Kbd className="absolute right-2 pointer-events-none">{hint}</Kbd>
      )}
    </div>
  ),
);
Input.displayName = 'Input';
