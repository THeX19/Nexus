import React from 'react';
import { create } from 'zustand';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cx } from '../lib/format';

type ToastTone = 'success' | 'danger' | 'info';
interface Toast { id: number; tone: ToastTone; title: string; description?: string }

const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, 'id'>) => void; dismiss: (id: number) => void }>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), t.tone === 'danger' ? 7000 : 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToasts.getState().push({ tone: 'success', title, description }),
  error: (title: string, description?: string) => useToasts.getState().push({ tone: 'danger', title, description }),
  info: (title: string, description?: string) => useToasts.getState().push({ tone: 'info', title, description }),
};

const icons = { success: CheckCircle2, danger: AlertCircle, info: Info };
const colors = { success: 'text-success', danger: 'text-danger', info: 'text-accent' };

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-32px)]">
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === 'danger' ? 'alert' : 'status'}
            className="flex items-start gap-2.5 p-3 bg-overlay rounded-lg shadow-pop animate-pop-in"
          >
            <Icon className={cx('w-4 h-4 mt-px shrink-0', colors[t.tone])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs text-muted mt-0.5 break-words selectable">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="grid place-items-center w-5 h-5 rounded text-subtle hover:text-fg hover:bg-fg/[0.08]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
