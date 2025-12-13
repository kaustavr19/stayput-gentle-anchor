import { ReactNode } from 'react';
import { Focus, StickyNote, History, Sparkles, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'focus' | 'notes' | 'history' | 'ai';
  onTabChange: (tab: 'focus' | 'notes' | 'history' | 'ai') => void;
  sideContent?: ReactNode;
}

const tabs = [
  { id: 'focus' as const, label: 'Focus', icon: Focus },
  { id: 'notes' as const, label: 'Notes', icon: StickyNote },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'ai' as const, label: 'Assist', icon: Sparkles },
];

export function Layout({ children, activeTab, onTabChange, sideContent }: LayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — minimal, editorial */}
      <header className="border-b border-border/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-foreground tracking-tight">
              StayPut
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <nav className="flex items-center gap-1 mr-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                    activeTab === id
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:text-foreground hover:bg-card/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content — sheet placed on desk */}
      <main className="flex-1 flex">
        <div className="flex-1 max-w-5xl mx-auto px-6 py-10 flex gap-10">
          {/* Primary content */}
          <div className="flex-1 max-w-lg mx-auto">
            {children}
          </div>

          {/* Side content (notepad on focus view) */}
          {sideContent && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-10 writing-space rounded-xl p-5 h-[calc(100vh-10rem)]">
                {sideContent}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer — barely there */}
      <footer className="border-t border-border/5 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-text-muted/60 text-center font-serif italic">
            Stay present. Stay put.
          </p>
        </div>
      </footer>
    </div>
  );
}
