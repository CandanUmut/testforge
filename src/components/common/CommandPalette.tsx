import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  PlayCircle,
  Bug,
  FileText,
  Cpu,
  BarChart3,
  Settings,
  Smartphone,
  Zap,
  X,
} from 'lucide-react';
import { demoTestRuns, demoCrashes, demoDevices } from '../../lib/demo-data';
import { useDataContext } from '../../contexts/DataContext';

// ─── Context / Hook ───────────────────────────────────────────────────────────

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: false,
  setOpen: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultCategory = 'Pages' | 'Test Runs' | 'Crashes' | 'Devices';

interface CommandResult {
  id: string;
  category: ResultCategory;
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
}

// ─── Static page list ─────────────────────────────────────────────────────────

function buildIndex(basePath: string, getScopedPath: (section?: 'dashboard' | 'test-runs' | 'devices' | 'crash-triage' | 'logs' | 'reports' | 'settings') => string): CommandResult[] {
  const pages: CommandResult[] = [
    { id: 'page-dashboard', category: 'Pages', title: 'Dashboard', subtitle: 'Overview & key metrics', path: getScopedPath('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'page-test-runs', category: 'Pages', title: 'Test Runs', subtitle: 'Browse and inspect test runs', path: getScopedPath('test-runs'), icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'page-crash-triage', category: 'Pages', title: 'Crash Triage', subtitle: 'Investigate & resolve crashes', path: getScopedPath('crash-triage'), icon: <Bug className="w-4 h-4" /> },
    { id: 'page-logs', category: 'Pages', title: 'Log Explorer', subtitle: 'Search device & test logs', path: getScopedPath('logs'), icon: <FileText className="w-4 h-4" /> },
    { id: 'page-devices', category: 'Pages', title: 'Devices', subtitle: 'Manage connected devices', path: getScopedPath('devices'), icon: <Cpu className="w-4 h-4" /> },
    { id: 'page-reports', category: 'Pages', title: 'Reports', subtitle: 'Trend charts & analytics', path: getScopedPath('reports'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'page-settings', category: 'Pages', title: 'Settings', subtitle: 'Organisation & API settings', path: getScopedPath('settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  const results: CommandResult[] = [...pages];

  for (const run of demoTestRuns.slice(0, 30)) {
    results.push({
      id: `run-${run.id}`,
      category: 'Test Runs',
      title: run.name,
      subtitle: [run.branch, run.build_number, run.status].filter(Boolean).join(' · '),
      path: `${basePath}/test-runs/${run.id}`,
      icon: <PlayCircle className="w-4 h-4" />,
    });
  }

  for (const crash of demoCrashes) {
    results.push({
      id: `crash-${crash.id}`,
      category: 'Crashes',
      title: crash.title,
      subtitle: [crash.severity, crash.status, crash.device?.name].filter(Boolean).join(' · '),
      path: getScopedPath('crash-triage'),
      icon: <Bug className="w-4 h-4" />,
    });
  }

  for (const device of demoDevices) {
    results.push({
      id: `device-${device.id}`,
      category: 'Devices',
      title: device.name,
      subtitle: [device.device_type, device.status, device.firmware_version].filter(Boolean).join(' · '),
      path: getScopedPath('devices'),
      icon: <Smartphone className="w-4 h-4" />,
    });
  }

  return results;
}

// ─── Fuzzy filter ─────────────────────────────────────────────────────────────

function fuzzyMatch(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const idx = h.indexOf(n[ni], hi);
    if (idx === -1) return false;
    hi = idx + 1;
  }
  return true;
}

function filterResults(query: string, allResults: CommandResult[], pageResults: CommandResult[]): CommandResult[] {
  if (!query.trim()) return pageResults;

  return allResults.filter(r =>
    fuzzyMatch(r.title, query) || fuzzyMatch(r.subtitle, query),
  );
}

// ─── Category colour helpers ──────────────────────────────────────────────────

const CATEGORY_STYLES: Record<ResultCategory, string> = {
  Pages:     'text-blue-400',
  'Test Runs': 'text-emerald-400',
  Crashes:   'text-red-400',
  Devices:   'text-violet-400',
};

const CATEGORY_ICON_BG: Record<ResultCategory, string> = {
  Pages:     'bg-blue-500/10 text-blue-400',
  'Test Runs': 'bg-emerald-500/10 text-emerald-400',
  Crashes:   'bg-red-500/10 text-red-400',
  Devices:   'bg-violet-500/10 text-violet-400',
};

// ─── Inner palette UI ─────────────────────────────────────────────────────────

interface PaletteProps {
  onClose: () => void;
}

function Palette({ onClose }: PaletteProps) {
  const navigate = useNavigate();
  const { basePath, getScopedPath } = useDataContext();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allResults = useMemo(() => buildIndex(basePath, getScopedPath), [basePath, getScopedPath]);
  const pageResults = useMemo(() => allResults.filter((result): result is CommandResult => result.category === 'Pages'), [allResults]);
  const results = filterResults(query, allResults, pageResults);

  // Group results by category, preserving insertion order
  const grouped = results.reduce<{ category: ResultCategory; items: CommandResult[] }[]>(
    (acc, item) => {
      const existing = acc.find(g => g.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        acc.push({ category: item.category, items: [item] });
      }
      return acc;
    },
    [],
  );

  // Flat list for keyboard navigation
  const flat = results;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const select = useCallback(
    (result: CommandResult) => {
      onClose();
      navigate(result.path);
    },
    [navigate, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[activeIndex]) select(flat[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4
                 sm:items-start sm:pt-[10vh]
                 backdrop-blur-sm bg-black/60"
      onClick={onClose}
    >
      {/* Modal card — full screen on mobile (slide up), centered on desktop */}
      <div
        className="
          w-full max-w-xl
          bg-white border border-gray-200 rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          max-h-[80vh]
          /* mobile: full screen slide-up */
          sm:max-h-[70vh]
          fixed bottom-0 left-0 right-0 rounded-b-none
          sm:static sm:rounded-2xl
          animate-slide-up sm:animate-fade-in
        "
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search test runs, crashes, devices..."
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                          bg-gray-100 border border-gray-200 text-gray-400 text-[10px] font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto flex-1 py-2">
          {flat.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
              <Zap className="w-8 h-8 opacity-30" />
              <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            grouped.map(group => {
              // track index offset to maintain flat index alignment
              const groupStartIndex = flat.indexOf(group.items[0]);
              return (
                <div key={group.category}>
                  {/* Category header */}
                  <p className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ${CATEGORY_STYLES[group.category]}`}>
                    {group.category}
                  </p>
                  {group.items.map((item, localIdx) => {
                    const idx = groupStartIndex + localIdx;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        onClick={() => select(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                          ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
                        `}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${CATEGORY_ICON_BG[item.category]}`}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                        {isActive && (
                          <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200
                                         text-gray-400 text-[10px] font-mono hidden sm:inline-flex">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-200 text-gray-400 text-[11px]">
          <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// ─── Public component (always rendered, hidden until open) ────────────────────

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  if (!open) return null;
  return <Palette onClose={() => setOpen(false)} />;
}

// ─── Provider (wraps the app so the hook works everywhere) ────────────────────

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
