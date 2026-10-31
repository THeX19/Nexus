import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon } from 'lucide-react';
import { cx } from '../lib/format';

export type MenuItem =
  | { type?: 'item'; label: string; icon?: LucideIcon; shortcut?: string; tone?: 'danger'; disabled?: boolean; onSelect: () => void }
  | { type: 'separator' }
  | { type: 'label'; label: string };

/** Floating menu positioned at a point (context menu) or under an anchor (dropdown).
 *  Arrow keys / Home / End to move, Enter to activate, Esc or outside click to close. */
export const Menu: React.FC<{
  items: MenuItem[];
  at: { x: number; y: number } | null;
  onClose: () => void;
  label?: string;
}> = ({ items, at, onClose, label = 'Actions' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const actionable = items
    .map((it, i) => ((it.type ?? 'item') === 'item' && !(it as { disabled?: boolean }).disabled ? i : -1))
    .filter((i) => i >= 0);
  const [active, setActive] = useState(actionable[0] ?? -1);

  useLayoutEffect(() => {
    if (!at || !ref.current) return setPos(null);
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: Math.max(8, Math.min(at.x, window.innerWidth - r.width - 8)),
      y: Math.max(8, Math.min(at.y, window.innerHeight - r.height - 8)),
    });
    setActive(actionable[0] ?? -1);
    ref.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at]);

  useEffect(() => {
    if (!at) return;
    const close = (e: Event) => {
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    document.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('blur', close);
      window.removeEventListener('resize', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [at, onClose]);

  if (!at) return null;

  const run = (i: number) => {
    const it = items[i];
    if (it && (it.type ?? 'item') === 'item') {
      onClose();
      (it as { onSelect: () => void }).onSelect();
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    const k = actionable.indexOf(active);
    if (e.key === 'ArrowDown') setActive(actionable[(k + 1) % actionable.length]);
    else if (e.key === 'ArrowUp') setActive(actionable[(k - 1 + actionable.length) % actionable.length]);
    else if (e.key === 'Home') setActive(actionable[0]);
    else if (e.key === 'End') setActive(actionable[actionable.length - 1]);
    else if (e.key === 'Enter' || e.key === ' ') run(active);
    else if (e.key === 'Escape' || e.key === 'Tab') onClose();
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onKey}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-[60] min-w-[200px] max-w-[280px] p-1 bg-overlay rounded-lg shadow-pop animate-pop-in focus-visible:outline-none"
      style={{ left: pos?.x ?? at.x, top: pos?.y ?? at.y, visibility: pos ? 'visible' : 'hidden' }}
    >
      {items.map((it, i) => {
        if (it.type === 'separator') return <div key={i} role="separator" className="h-px my-1 mx-1 bg-line" />;
        if (it.type === 'label')
          return (
            <div key={i} className="px-2 pt-1.5 pb-1 text-2xs font-medium text-subtle truncate">
              {it.label}
            </div>
          );
        const Icon = it.icon;
        return (
          <div
            key={i}
            role="menuitem"
            aria-disabled={it.disabled}
            onMouseEnter={() => !it.disabled && setActive(i)}
            onClick={() => !it.disabled && run(i)}
            className={cx(
              'flex items-center gap-2 h-7 px-2 rounded-md text-sm cursor-default',
              it.disabled && 'opacity-40',
              active === i && (it.tone === 'danger' ? 'bg-danger/[0.14] text-danger' : 'bg-fg/[0.07] text-fg'),
              active !== i && (it.tone === 'danger' ? 'text-danger' : 'text-fg/90'),
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />}
            <span className="truncate flex-1">{it.label}</span>
            {it.shortcut && <span className="text-2xs text-subtle">{it.shortcut}</span>}
          </div>
        );
      })}
    </div>,
    document.body,
  );
};

/** Helper: open a menu from a context-menu event or from a trigger button. */
export function useMenu() {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  return {
    at,
    close: () => setAt(null),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      setAt({ x: e.clientX, y: e.clientY });
    },
    openFrom: (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      setAt({ x: r.right - 200, y: r.bottom + 4 });
    },
  };
}
