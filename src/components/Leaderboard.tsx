import { useLeaderboard, getXPTier } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';

function Avatar({ name, photoURL, size = 'md' }: { name: string; photoURL?: string | null; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={`${sz} rounded-full object-cover shrink-0`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div className={`${sz} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0`}>
      {initials || '?'}
    </div>
  );
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const { entries, isLoading } = useLeaderboard();
  const { user } = useAuth();

  const myRank = user ? entries.findIndex(e => e.uid === user.uid) + 1 : 0;
  const myEntry = user ? entries.find(e => e.uid === user.uid) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-serif font-medium text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Top focus streaks across StayPut</p>
        </div>
        {myEntry && myRank > 0 && (
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Your rank</p>
            <p className="text-lg font-serif font-medium text-foreground">#{myRank}</p>
          </div>
        )}
      </div>

      {/* My XP card — if on the board */}
      {myEntry && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 flex items-center gap-3">
          <Avatar name={myEntry.displayName} photoURL={myEntry.photoURL} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {myEntry.displayName} <span className="text-muted-foreground font-normal">(you)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {myEntry.totalSessions} session{myEntry.totalSessions !== 1 ? 's' : ''} · {myEntry.totalFocusMinutes} min focused
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-primary">{myEntry.totalXP.toLocaleString()} XP</p>
            <p className="text-[10px] text-muted-foreground">{getXPTier(myEntry.totalXP).label}</p>
          </div>
        </div>
      )}

      {!myEntry && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
          Complete a session to appear on the leaderboard.
        </div>
      )}

      {/* Top entries */}
      {entries.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm font-serif italic">
          No sessions yet. Be the first to focus.
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, i) => {
            const isMe = user?.uid === entry.uid;
            const tier = getXPTier(entry.totalXP);
            const medal = RANK_MEDALS[i];

            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isMe
                    ? 'bg-primary/[0.06] border border-primary/15'
                    : 'hover:bg-muted/40'
                }`}
              >
                {/* Rank */}
                <div className="w-7 text-center shrink-0">
                  {medal ? (
                    <span className="text-base leading-none">{medal}</span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar name={entry.displayName} photoURL={entry.photoURL} size="sm" />

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.displayName}
                    {isMe && <span className="ml-1.5 text-[10px] text-primary font-normal">you</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {entry.totalSessions} session{entry.totalSessions !== 1 ? 's' : ''} · {entry.totalFocusMinutes}m
                  </p>
                </div>

                {/* XP + tier */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{entry.totalXP.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{tier.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* XP guide */}
      <div className="border-t border-border/60 pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">How XP is earned</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
            <p className="font-medium text-foreground">Open</p>
            <p>1 XP / min</p>
          </div>
          <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
            <p className="font-medium text-foreground">Pomodoro</p>
            <p>1.5 XP / min<br/>+15 XP bonus</p>
          </div>
          <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
            <p className="font-medium text-foreground">Deep Work</p>
            <p>2 XP / min<br/>+50 XP bonus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
