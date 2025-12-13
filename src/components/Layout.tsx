import { ReactNode, useState } from 'react';
import { Focus, StickyNote, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center">
              <Focus className="w-4 h-4 text-accent-primary" />
            </div>
            <span className="text-lg font-medium text-foreground tracking-tight">
              StayPut
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                  activeTab === id
                    ? "bg-accent-soft text-accent-primary"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex">
        <div className="flex-1 max-w-6xl mx-auto px-6 py-8 flex gap-8">
          {/* Primary content */}
          <div className="flex-1 max-w-xl mx-auto">
            {children}
          </div>

          {/* Side content (notepad on focus view) */}
          {sideContent && (
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-8 bg-bg-secondary border border-border/10 rounded-xl p-4 h-[calc(100vh-8rem)]">
                {sideContent}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-text-muted text-center font-serif italic">
            "Stay present. Stay put."
          </p>
        </div>
      </footer>
    </div>
  );
}
