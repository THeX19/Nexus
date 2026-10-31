import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

const useSlot = create<{ node: HTMLElement | null; set: (n: HTMLElement | null) => void; crumbs: string[]; setCrumbs: (c: string[]) => void }>(
  (set) => ({ node: null, set: (node) => set({ node }), crumbs: [], setCrumbs: (crumbs) => set({ crumbs }) }),
);

/** The top bar exposes a slot; each page portals its contextual actions into it. */
export const TopBarActionsHost: React.FC<{ className?: string }> = ({ className }) => {
  const set = useSlot((s) => s.set);
  return <div ref={set} className={className} />;
};

export const TopBarActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const node = useSlot((s) => s.node);
  return node ? createPortal(children, node) : null;
};

/** Extra breadcrumb segments beyond "Group / Page" (e.g. a folder path). */
export function useBreadcrumb(crumbs: string[]) {
  const setCrumbs = useSlot((s) => s.setCrumbs);
  const key = crumbs.join('\u0000');
  useEffect(() => {
    setCrumbs(crumbs);
    return () => setCrumbs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
export const useCrumbs = () => useSlot((s) => s.crumbs);

export function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
