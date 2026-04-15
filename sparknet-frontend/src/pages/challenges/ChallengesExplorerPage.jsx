import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ChallengeCard } from '../../components/challenges/ChallengeSystem';

export const ChallengesExplorerPage = () => {
  const [filter, setFilter] = useState('all');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data } = await api.get('/challenges');
        if (data.success) {
          setChallenges(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch challenges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
            Missions & Objectives
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium">Acquire new capabilities, gather credits, and ascend the ranks.</p>
            {user?.role !== 'child' && (
              <a href="/challenges/create" className="btn-secondary py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 max-w-fit">
                <span className="material-symbols-outlined text-[14px]">add</span> Deploy New
              </a>
            )}
          </div>
        </div>
        
        <div className="flex bg-surface-container-highest rounded-2xl p-1.5 overflow-x-auto border border-outline-variant/10 shadow-inner">
          {['all', 'coding', 'wellness', 'community'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-high'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-slate-400 col-span-full text-center py-10 tracking-widest font-headline uppercase font-bold text-[11px]">Loading missions...</p>
        ) : (
          filteredChallenges.map(challenge => {
            const userIdMatches = (p) => {
              const id1 = p.userId?._id || p.userId;
              const id2 = user?._id || user?.id;
              return id1 && id2 && String(id1) === String(id2);
            };
            const isJoined = challenge.participants?.some(userIdMatches);
            return <ChallengeCard key={challenge._id} challenge={challenge} isJoined={isJoined} />;
          })
        )}
      </div>
      
      {!loading && filteredChallenges.length === 0 && (
         <div className="text-center py-20 bg-surface-container rounded-3xl border border-outline-variant/5">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 opacity-50">search_off</span>
            <p className="text-slate-400 font-medium font-headline tracking-wide">No active missions in this category.</p>
         </div>
      )}
    </div>
  );
};
