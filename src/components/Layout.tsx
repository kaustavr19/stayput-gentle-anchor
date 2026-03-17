import { ReactNode } from 'react';
import { Focus, StickyNote, History, Sparkles, BarChart2, Trophy, Sun, Moon, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';

export type AppTab = 'focus' | 'notes' | 'history' | 'analytics' | 'ai' | 'leaderboard';

interface LayoutProps {
  children: ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  sideContent?: ReactNode;
}

const tabs = [
  { id: 'focus'       as const, label: 'Focus',     icon: Focus,     comingSoon: false },
  { id: 'notes'       as const, label: 'Notes',     icon: StickyNote, comingSoon: false },
  { id: 'history'     as const, label: 'History',   icon: History,   comingSoon: false },
  { id: 'analytics'   as const, label: 'Analytics', icon: BarChart2, comingSoon: false },
  { id: 'leaderboard' as const, label: 'Leaders',   icon: Trophy,    comingSoon: false },
  { id: 'ai'          as const, label: 'Assist',    icon: Sparkles,  comingSoon: true  },
];

export function Layout({ children, activeTab, onTabChange, sideContent }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — frosted glass, barely-there */}
      <header className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between rounded-2xl px-4 py-2.5 glass border border-border/60 shadow-[0_1px_3px_hsl(220_20%_13%/0.06),0_4px_16px_hsl(220_20%_13%/0.05)]">
            {/* Logo */}
            <Logo />

            {/* Nav tabs — pill style */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {tabs.map(({ id, label, icon: Icon, comingSoon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === id
                      ? "tab-active text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  {comingSoon && (
                    <span className="hidden sm:inline ml-0.5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary/70 leading-none">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Sun className="w-3.5 h-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-3.5 h-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  title="Sign out"
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/auth')}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="sr-only">Sign in</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex px-4 py-5 pb-24 lg:pb-5">
        <div className="flex-1 max-w-7xl mx-auto flex gap-6">
          {/* Primary panel */}
          <div className="flex-1 min-w-0">
            <div className="card-depth rounded-2xl p-6 min-h-[68vh] animate-fade-in">
              {children}
            </div>
          </div>

          {/* Sidebar (notepad on focus view) */}
          {sideContent && (
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-20 card-surface rounded-2xl p-5 h-[calc(100vh-8.5rem)] overflow-hidden">
                {sideContent}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile bottom nav — hidden on lg+ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 glass">
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map(({ id, label, icon: Icon, comingSoon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[44px] transition-colors",
                activeTab === id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-none">{label}</span>
              {comingSoon && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary/60" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer mantra */}
      <footer className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-muted-foreground/70 text-center font-serif italic tracking-wide">
            Stay present. Stay put.
          </p>
        </div>
      </footer>
    </div>
  );
}
