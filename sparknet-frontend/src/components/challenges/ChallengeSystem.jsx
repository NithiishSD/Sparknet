import { Link } from 'react-router-dom';

/* ── Progress Bar ──────────────────────────────────── */
export const ProgressBar = ({ progress, label }) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-[10px] font-headline font-bold uppercase tracking-widest text-slate-500 mb-2">
        <span>{label}</span>
        <span className="text-primary">{progress}%</span>
      </div>
    )}
    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  </div>
);

/* ── Challenge Card ────────────────────────────────── */
export const ChallengeCard = ({ challenge, isJoined }) => (
  <div className="bg-surface-container p-8 rounded-3xl flex flex-col group overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 shadow-xl relative mt-4">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors -translate-y-1/2 translate-x-1/2"></div>
    
    <div className="absolute top-4 right-4 z-10">
      <span className="px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/10 text-[10px] font-headline font-bold text-primary uppercase tracking-widest backdrop-blur-md shadow-sm">
        {challenge.points} pts
      </span>
    </div>
    
    <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:-translate-y-1 transition-transform relative z-10 group-hover:border-primary/20 group-hover:text-primary">
      {challenge.icon || <span className="material-symbols-outlined text-3xl">emoji_events</span>}
    </div>
    
    <h3 className="font-headline font-bold text-xl text-on-surface mb-2 tracking-tight relative z-10">{challenge.title}</h3>
    <p className="text-sm text-slate-400 mb-8 flex-1 leading-relaxed relative z-10">{challenge.description}</p>
    
    <div className="relative z-10">
      {isJoined ? (
        <div className="space-y-6">
          <ProgressBar progress={challenge.progress || 0} label="Completion Status" />
          <Link 
            to={`/challenges/${challenge._id || challenge.id}`}
            className="btn-secondary w-full text-center flex items-center justify-center gap-2 py-3"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            View Metrics
          </Link>
        </div>
      ) : (
        <Link 
          to={`/challenges/${challenge._id || challenge.id}`}
          className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3 shadow-[0_0_15px_rgba(173,198,255,0.15)] group-hover:shadow-[0_0_20px_rgba(173,198,255,0.25)] transition-shadow"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Accept Challenge
        </Link>
      )}
    </div>
  </div>
);

/* ── Leaderboard Table ─────────────────────────────── */
export const LeaderboardTable = ({ entries, onVote, votingFor, currentUserId }) => (
  <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container shadow-2xl">
    <table className="w-full text-left text-sm text-slate-300">
      <thead className="bg-surface-container-highest border-b border-outline-variant/10 font-headline text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <tr>
          <th className="px-6 py-5 rounded-tl-3xl">Rank</th>
          <th className="px-6 py-5">Operator</th>
          <th className="px-6 py-5 text-right">Score</th>
          {onVote && <th className="px-6 py-5 text-right rounded-tr-3xl">Vote</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/5">
        {entries.map((entry, idx) => (
          <tr 
            key={entry._id || entry.id} 
            className="hover:bg-surface-container-high transition-colors group"
          >
            <td className="px-6 py-5">
              <span className={`font-headline font-black text-lg ${
                idx === 0 ? 'text-tertiary-fixed drop-shadow-[0_0_8px_rgba(255,218,102,0.5)]' : 
                idx === 1 ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.3)]' : 
                idx === 2 ? 'text-orange-300/80' : 
                'text-slate-600'
              }`}>
                {idx === 0 ? (
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span> 1</span>
                ) : (
                  `#${idx + 1}`
                )}
              </span>
            </td>
            <td className="px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-sm font-headline font-black text-slate-400 group-hover:border-primary/30 transition-colors shadow-inner">
                  {(entry.user?.username || entry.username || '?')[0]?.toUpperCase()}
                </div>
                <span className="font-headline font-bold text-slate-200 tracking-wide">{entry.user?.username || entry.username || 'Unknown'}</span>
              </div>
            </td>
            <td className="px-6 py-5 text-right">
              <span className="font-headline font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 tracking-wide inline-block shadow-sm">
                {entry.score}
              </span>
            </td>
            {onVote && (() => {
              const entryUserId = entry.user?._id || entry.userId;
              const isOwnEntry = String(entryUserId) === String(currentUserId);
              return (
                <td className="px-6 py-5 text-right">
                  {!isOwnEntry && (
                    <button
                      onClick={() => onVote(entryUserId)}
                      disabled={votingFor === entryUserId}
                      className="px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary border border-tertiary/20 text-xs font-bold font-headline hover:bg-tertiary/20 transition-colors disabled:opacity-50"
                    >
                      {votingFor === entryUserId ? '...' : '▲ Vote'}
                    </button>
                  )}
                </td>
              );
            })()}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
