import { useEffect } from 'react';
import { useUiStore } from '../store/useUiStore';

/** Mirrors appearance prefs onto <html> data attributes; CSS tokens do the rest.
 *  "system" follows the desktop's color scheme via the portal-backed media query. */
export function useAppearance() {
  const theme = useUiStore((s) => s.theme);
  const density = useUiStore((s) => s.density);
  const accent = useUiStore((s) => s.accent);
  const motion = useUiStore((s) => s.motion);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.density = density;
    root.dataset.accent = accent;
    root.dataset.motion = motion;
  }, [theme, density, accent, motion]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => (document.documentElement.dataset.system = mq.matches ? 'light' : 'dark');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
}
