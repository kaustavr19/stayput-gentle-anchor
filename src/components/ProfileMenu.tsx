import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Key, Trash2, AlertTriangle, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getGeminiApiKey, clearGeminiApiKey } from '@/lib/gemini';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, photoURL }: { name: string; photoURL?: string | null }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className="w-7 h-7 rounded-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
      {initials || '?'}
    </div>
  );
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteDialog({ onConfirm, onCancel, busy }: {
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-depth rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Delete your account?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We're sad to see you go. This will permanently delete all your sessions, notes, tasks, and leaderboard data. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" onClick={onCancel} disabled={busy} className="flex-1 text-muted-foreground">
            Keep my account
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 bg-destructive/90 hover:bg-destructive text-white"
          >
            {busy ? 'Deleting…' : 'Yes, delete it'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileMenu() {
  const { user, signOut, clearAccountData, deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'Account';

  const handleDeleteApiKey = () => {
    clearGeminiApiKey();
    setApiKey('');
    setMessage('API key removed.');
    setTimeout(() => setMessage(null), 2000);
  };

  const handleClearData = async () => {
    setBusy(true);
    try {
      await clearAccountData();
      setShowClearConfirm(false);
      setMessage('All account data cleared.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      // onAuthStateChanged will redirect to /auth automatically
    } catch (err) {
      setBusy(false);
      setShowDeleteDialog(false);
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('recent') || msg.toLowerCase().includes('reauthenticate')) {
        setMessage('Please sign out and sign back in, then try again.');
      } else {
        setMessage('Failed to delete account. Please try again.');
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <>
      {showDeleteDialog && (
        <DeleteDialog
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
          busy={busy}
        />
      )}

      <div className="relative" ref={menuRef}>
        {/* Trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 h-8 px-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
        >
          <Avatar name={displayName} photoURL={user.photoURL} />
          <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-10 z-50 w-72 card-depth rounded-2xl shadow-lg border border-border/50 overflow-hidden animate-fade-in">
            {/* User info */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-border/40">
              <Avatar name={displayName} photoURL={user.photoURL} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              {/* Feedback message */}
              {message && (
                <p className="text-xs text-primary px-3 py-1.5">{message}</p>
              )}

              {/* API key section */}
              <button
                onClick={() => { setShowApiKey(v => !v); setShowClearConfirm(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors text-left"
              >
                <Key className="w-3.5 h-3.5 shrink-0" />
                Manage AI API key
              </button>

              {showApiKey && (
                <div className="mx-2 mb-1 rounded-xl border border-border/30 bg-muted/20 p-3 space-y-2 text-xs">
                  {apiKey ? (
                    <>
                      <p className="text-muted-foreground">Groq key stored in browser:</p>
                      <p className="font-mono text-foreground bg-muted/40 rounded-lg px-2 py-1 truncate">
                        {apiKey.slice(0, 8)}{'•'.repeat(20)}
                      </p>
                      <button
                        onClick={handleDeleteApiKey}
                        className="flex items-center gap-1.5 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove key
                      </button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No API key stored. Visit the Assist tab to add one.</p>
                  )}
                </div>
              )}

              {/* Clear account data */}
              <button
                onClick={() => { setShowClearConfirm(v => !v); setShowApiKey(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Clear account data
              </button>

              {showClearConfirm && (
                <div className="mx-2 mb-1 rounded-xl border border-border/30 bg-muted/20 p-3 space-y-2 text-xs">
                  <p className="text-muted-foreground">This deletes all sessions, notes, tasks, and your leaderboard entry. Your account stays.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearData}
                      disabled={busy}
                      className="flex-1 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      {busy ? 'Clearing…' : 'Clear all data'}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete account */}
              <button
                onClick={() => { setOpen(false); setShowDeleteDialog(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors text-left"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Delete account
              </button>

              {/* Divider + Sign out */}
              <div className="border-t border-border/40 mt-1 pt-1">
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
