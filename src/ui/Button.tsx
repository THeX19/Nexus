import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cx } from '../lib/format';
import { Spinner } from './primitives';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:brightness-110 active:brightness-95',
  secondary: 'bg-raised text-fg border border-line hover:bg-overlay hover:border-line-strong',
  ghost: 'text-muted hover:text-fg hover:bg-fg/[0.06]',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  shortcut?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon: Icon, loading, shortcut, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap select-none',
        'transition-[background-color,border-color,color,filter,transform] duration-fast ease-out active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none',
        size === 'md' ? 'h-ctl px-3 text-sm' : 'h-6 px-2 text-xs',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="w-3.5 h-3.5" /> : Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
      {children}
      {shortcut && <span className="ml-1 text-2xs opacity-60 font-mono">{shortcut}</span>}
    </button>
  ),
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  tone?: 'default' | 'danger' | 'warning';
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, tone = 'default', active, className, ...rest }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cx(
        'inline-grid place-items-center w-ctl h-ctl rounded-md text-muted shrink-0',
        'transition-colors duration-fast hover:bg-fg/[0.07] disabled:opacity-40 disabled:pointer-events-none',
        tone === 'danger' && 'hover:text-danger',
        tone === 'warning' && 'hover:text-warning',
        tone === 'default' && 'hover:text-fg',
        active && 'text-fg bg-fg/[0.07]',
        className,
      )}
      {...rest}
    >
      <Icon className="w-4 h-4" aria-hidden />
    </button>
  ),
);
IconButton.displayName = 'IconButton';
