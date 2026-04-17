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
  <div className="bg-surface-container/60 backdrop-blur-xl p-8 rounded-[2rem] flex flex-col group overflow-hidden border border-outline-variant/10 hover:border-primary/40 transition-all duration-700 shadow-2xl relative mt-4 hover:-translate-y-1.5 hover:shadow-primary/10">
    {/* Decorative Gradient Glow */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all duration-700 -translate-y-1/3 translate-x-1/3"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-tertiary/5 rounded-full blur-[50px] group-hover:bg-tertiary/10 transition-all duration-700 translate-y-1/2 -translate-x-1/2"></div>
    
    <div className="absolute top-6 right-6 z-10">
      <div className="px-4 py-1.5 rounded-full bg-surface-container-highest/80 border border-outline-variant/20 text-[11px] font-headline font-black text-primary uppercase tracking-[0.15em] backdrop-blur-md shadow-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
        {challenge.points} PTS
      </div>
    </div>
    
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-container-highest to-surface-container border border-outline-variant/20 flex items-center justify-center text-4xl mb-8 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-primary/20 group-hover:border-primary/30">
        {challenge.icon || <span className="material-symbols-outlined text-3xl text-primary">emoji_events</span>}
      </div>
      
      {/* Heading with fix for overflow */}
      <h3 className="font-headline font-black text-2xl text-on-surface mb-3 tracking-tighter leading-tight group-hover:text-primary transition-colors pr-2">
        {challenge.title}
      </h3>
      
      <p className="text-sm text-slate-400 mb-10 flex-1 leading-relaxed font-medium opacity-80 line-clamp-3">
        {challenge.description}
      </p>
      
      <div className="pt-2 border-t border-outline-variant/5">
        {isJoined ? (
          <div className="space-y-6">
            <ProgressBar progress={challenge.progress || 0} label="Completion Status" />
            <Link 
              to={`/challenges/${challenge._id || challenge.id}`}
              className="btn-secondary w-full text-center flex items-center justify-center gap-3 py-4 rounded-2xl border-primary/10 hover:border-primary/30 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] animate-pulse">analytics</span>
              <span className="font-headline font-bold uppercase tracking-widest text-[11px]">View Operational Metrics</span>
            </Link>
          </div>
        ) : (
          <Link 
            to={`/challenges/${challenge._id || challenge.id}`}
            className="btn-primary w-full text-center flex items-center justify-center gap-3 py-4 rounded-2xl shadow-[0_8px_30px_rgba(173,198,255,0.2)] hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="font-headline font-bold uppercase tracking-widest text-[11px]">Accept Mission</span>
          </Link>
        )}
      </div>
    </div>
  </div>
);

/* ── Leaderboard Table ─────────────────────────────── */
export const LeaderboardTable = ({ entries, onVote, votingFor, currentUserId }) => (
  <div className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container/40 backdrop-blur-md shadow-2xl transition-all duration-500 hover:shadow-primary/5">
    <table className="w-full text-left text-sm text-slate-300">
      <thead className="bg-surface-container-highest/50 border-b border-outline-variant/10 font-headline text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
        <tr>
          <th className="px-8 py-6 rounded-tl-[2rem]">Rank</th>
          <th className="px-8 py-6">Identity</th>
          <th className="px-8 py-6 text-right">Momentum</th>
          {onVote && <th className="px-8 py-6 text-right rounded-tr-[2rem]">Action</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/5">
        {entries.map((entry, idx) => (
          <tr 
            key={entry._id || entry.id} 
            className="hover:bg-primary/5 transition-all duration-300 group"
          >
            <td className="px-8 py-6">
              <span className={`font-headline font-black text-2xl ${
                idx === 0 ? 'text-tertiary-fixed drop-shadow-[0_0_15px_rgba(255,218,102,0.4)] scale-110 inline-block' : 
                idx === 1 ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.2)]' : 
                idx === 2 ? 'text-orange-300/80' : 
                'text-slate-600'
              }`}>
                {idx === 0 ? (
                  <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span> I</span>
                ) : (
                  `${idx + 1}`
                )}
              </span>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/80 border border-outline-variant/20 flex items-center justify-center text-sm font-headline font-black text-slate-400 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-500 shadow-lg overflow-hidden">
                  {(entry.user?.username || entry.username || '?')[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-black text-on-surface tracking-tight group-hover:text-primary transition-colors text-base">{entry.user?.username || entry.username || 'Unknown'}</span>
                  <span className="text-[10px] font-headline uppercase tracking-widest text-slate-500 font-bold">Verified Operator</span>
                </div>
              </div>
            </td>
            <td className="px-8 py-6 text-right">
              <span className="font-headline font-black text-primary px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 tracking-tighter inline-block shadow-inner group-hover:scale-105 transition-transform">
                {entry.score}
              </span>
            </td>
            {onVote && (() => {
              const entryUserId = entry.user?._id || entry.userId;
              const isOwnEntry = String(entryUserId) === String(currentUserId);
              return (
                <td className="px-8 py-6 text-right">
                  {!isOwnEntry && (
                    <button
                      onClick={() => onVote(entryUserId)}
                      disabled={votingFor === entryUserId}
                      className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black font-headline uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300 disabled:opacity-50 shadow-sm"
                    >
                      {votingFor === entryUserId ? '...' : 'Signal Support'}
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
