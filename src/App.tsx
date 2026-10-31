import React, { Suspense, lazy } from 'react';
import { Sidebar } from './shell/Sidebar';
import { TopBar } from './shell/TopBar';
import { CommandPalette } from './shell/CommandPalette';
import { useUiStore, PageId } from './store/useUiStore';
import { useTelemetry } from './hooks/useTelemetry';
import { useAppearance } from './hooks/useAppearance';
import { useHotkeys } from './hooks/useHotkeys';
import { ALL_PAGES } from './lib/nav';
import { Spinner, Toaster } from './ui';
import { Dashboard } from './pages/Dashboard';

// Overview is eager (first paint); every other screen is code-split and loaded on first visit.
const pages: Record<PageId, React.ComponentType> = {
  dashboard: Dashboard,
  processes: lazy(() => import('./pages/Processes').then((m) => ({ default: m.Processes }))),
  storage: lazy(() => import('./pages/Storage').then((m) => ({ default: m.Storage }))),
  network: lazy(() => import('./pages/Network').then((m) => ({ default: m.Network }))),
  search: lazy(() => import('./pages/SystemSearch').then((m) => ({ default: m.SystemSearch }))),
  terminal: lazy(() => import('./pages/Terminal').then((m) => ({ default: m.Terminal }))),
  settings: lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings }))),
  help: lazy(() => import('./pages/Help').then((m) => ({ default: m.Help }))),
};

function App() {
  useAppearance();
  useTelemetry();
  const page = useUiStore((s) => s.page);
  const { setPage, toggleSidebar, setPaletteOpen } = useUiStore.getState();

  useHotkeys([
    { combo: 'mod+k', handler: () => setPaletteOpen(!useUiStore.getState().paletteOpen) },
    { combo: 'mod+p', handler: () => setPaletteOpen(true) },
    { combo: 'mod+b', handler: toggleSidebar },
    { combo: 'f1', handler: () => setPage('help') },
    { combo: '?', handler: () => setPage('help') },
    ...ALL_PAGES.filter((p) => p.hotkey).map((p) => ({ combo: `mod+${p.hotkey}`, handler: () => setPage(p.id) })),
  ]);

  const Current = pages[page];
  return (
    <div className="flex h-full overflow-hidden">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:px-3 focus:py-1.5 focus:bg-overlay focus:rounded-md">
        Skip to content
      </a>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main id="main" tabIndex={-1} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <Suspense
            fallback={
              <div className="grid place-items-center h-full">
                <Spinner />
              </div>
            }
          >
            <Current key={page} />
          </Suspense>
        </main>
      </div>
      <CommandPalette />
      <Toaster />
    </div>
  );
}

export default App;
