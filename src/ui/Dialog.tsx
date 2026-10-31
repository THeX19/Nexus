import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { cx } from '../lib/format';
import { Button } from './Button';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Modal surface with focus trap, Esc to close, focus restore and backdrop click. */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  label?: string;
  className?: string;
  position?: 'center' | 'top';
  children: React.ReactNode;
}> = ({ open, onClose, labelledBy, label, className, position = 'center', children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab' && node) {
        const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const [a, b] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) (e.preventDefault(), b.focus());
        else if (!e.shiftKey && document.activeElement === b) (e.preventDefault(), a.focus());
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className={cx(
        'fixed inset-0 z-50 flex justify-center px-4 bg-black/40 animate-fade-in',
        position === 'center' ? 'items-center' : 'items-start pt-[12vh]',
      )}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        className={cx('w-full bg-overlay rounded-xl shadow-pop animate-pop-in overflow-hidden', className)}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, description, confirmLabel, tone = 'danger', icon: Icon = AlertTriangle, onConfirm, onCancel }) => {
  const id = useId();
  return (
    <Modal open={open} onClose={onCancel} labelledBy={id} className="max-w-[400px]">
      <div className="p-5 flex gap-3.5">
        <div
          className={cx(
            'grid place-items-center w-8 h-8 rounded-lg shrink-0',
            tone === 'danger' ? 'bg-danger/[0.12] text-danger' : 'bg-accent/[0.12] text-accent',
          )}
        >
          <Icon className="w-4 h-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1.5">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          <div className="text-sm text-muted break-words">{description}</div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-fg/[0.02]">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} data-autofocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
