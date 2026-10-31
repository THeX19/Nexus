import { useEffect, useRef } from 'react';

export type Hotkey = { combo: string; handler: (e: KeyboardEvent) => void; allowInInput?: boolean };

/** combo format: "mod+k", "mod+shift+p", "?", "escape". "mod" = Ctrl (Meta on macOS). */
function matches(e: KeyboardEvent, combo: string) {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop()!;
  const mod = parts.includes('mod');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt');
  const modPressed = e.ctrlKey || e.metaKey;
  if (mod !== modPressed || alt !== e.altKey) return false;
  if (key.length > 1 || /[a-z0-9]/.test(key)) {
    if (shift !== e.shiftKey) return false;
  }
  return e.key.toLowerCase() === key;
}

const isEditable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function useHotkeys(keys: Hotkey[]) {
  const ref = useRef(keys);
  ref.current = keys;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const k of ref.current) {
        if (!matches(e, k.combo)) continue;
        if (!k.allowInInput && isEditable(e.target) && !k.combo.includes('mod')) continue;
        e.preventDefault();
        k.handler(e);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
