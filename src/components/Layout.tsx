import { ReactNode } from 'react';
import { Focus, StickyNote, History, Sparkles, Sun, Moon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — minimal, fades into background */}
      <header className="px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-base font-serif font-medium text-foreground/80 tracking-tight">
            StayPut
          </span>
          
          <div className="flex items-center gap-1">
            {/* Navigation — quiet tabs */}
            <nav className="flex items-center gap-0.5 mr-3">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                    activeTab === id
                      ? "bg-foreground/5 text-foreground"
                      : "text-text-muted/60 hover:text-text-muted"
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
              className="h-9 w-9 text-text-muted/50 hover:text-text-muted"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth button */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-text-muted/60 hover:text-text-muted text-xs"
              >
                Sign out
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/auth')}
                className="h-9 w-9 text-text-muted/50 hover:text-text-muted"
              >
                <User className="w-4 h-4" />
                <span className="sr-only">Sign in</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content — more generous space */}
      <main className="flex-1 flex px-4 py-6">
        <div className="flex-1 max-w-6xl mx-auto flex gap-8">
          {/* Primary surface — wider, more open */}
          <div className="flex-1">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/10 p-6 min-h-[65vh]">
              {children}
            </div>
          </div>

          {/* Side content (notepad on focus view) */}
          {sideContent && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-6 bg-card/20 backdrop-blur-sm rounded-2xl border border-border/10 p-5 h-[calc(100vh-10rem)]">
                {sideContent}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer — mantra */}
      <footer className="px-4 py-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-text-muted/40 text-center font-serif italic">
            Stay present. Stay put.
          </p>
        </div>
      </footer>
    </div>
  );
}