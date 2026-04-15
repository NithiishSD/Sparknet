import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LeaderboardTable, ProgressBar } from '../../components/challenges/ChallengeSystem';

export const ChallengeDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryText, setEntryText] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingFor, setVotingFor] = useState(null);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      const [challengeRes, leaderboardRes] = await Promise.all([
        api.get(`/challenges/${id}`),
        api.get(`/challenges/${id}/leaderboard`)
      ]);
      if (challengeRes.data.success) setChallenge(challengeRes.data.data);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load mission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChallengeData();
  }, [id]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await api.post('/challenges/join', { challengeId: id });
      toast.success('Mission engaged successfully');
      fetchChallengeData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join mission');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmit = async () => {
    if (!entryText.trim()) return toast.error('Transmission cannot be empty');
    setIsSubmitting(true);
    try {
      await api.post(`/challenges/${id}/submit`, { entry: entryText });
      toast.success('Solution transmitted successfully');
      setEntryText('');
      fetchChallengeData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transmission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (candidateUserId) => {
    setVotingFor(candidateUserId);
    try {
      await api.post(`/challenges/${id}/vote`, { candidateUserId });
      toast.success('Vote cast successfully!');
      fetchChallengeData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
    } finally {
      setVotingFor(null);
    }
  };

  if (loading) {
     return <div className="max-w-5xl mx-auto py-20 text-center text-slate-400 font-headline uppercase font-bold text-[11px] tracking-widest">Loading mission data...</div>;
  }
  if (!challenge) {
     return <div className="max-w-5xl mx-auto py-20 text-center text-red-400 font-headline uppercase tracking-widest">Mission Not Found</div>;
  }

  const userIdMatches = (p) => {
    const id1 = p.userId?._id || p.userId;
    const id2 = user?._id || user?.id;
    return id1 && id2 && String(id1) === String(id2);
  };
  const isJoined = challenge.participants?.some(userIdMatches);
  const participant = challenge.participants?.find(userIdMatches);
  const hasSubmitted = !!participant?.entry;

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter py-8 px-4 sm:px-6">
      {/* Back link */}
      <div>
        <Link to="/challenges" className="inline-flex items-center gap-2 text-[11px] font-headline font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors bg-surface-container-highest px-4 py-2 rounded-full hover:bg-primary/10">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Return to Explorer
        </Link>
      </div>

      {/* Hero */}
      <div className="relative bg-surface-container rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-container/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_15px_rgba(173,198,255,0.4)]">{challenge.icon || 'emoji_events'}</span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant/10 text-[11px] font-headline font-bold text-primary uppercase tracking-widest backdrop-blur-md">
                  {challenge.points} pts
                </span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant/10 text-[11px] font-headline font-bold text-tertiary uppercase tracking-widest backdrop-blur-md">
                  {challenge.category}
                </span>
              </div>
              <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface tracking-tighter mb-4">{challenge.title}</h1>
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1 block">Mission Objective</span>
                <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{challenge.description}</p>
              </div>
            </div>
            {!isJoined ? (
              <button 
                onClick={handleJoin}
                disabled={isJoining}
                className="btn-primary px-10 py-4 w-full md:w-auto shrink-0 shadow-[0_0_20px_rgba(173,198,255,0.2)] text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">add_task</span>
                {isJoining ? 'Engaging...' : 'Engage Mission'}
              </button>
            ) : (
              <div className="px-10 py-4 rounded-full bg-surface-container-highest border border-primary/30 text-primary font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                Mission Active
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-surface-container rounded-3xl p-8 lg:p-10 border border-outline-variant/5">
            <h2 className="font-headline font-bold text-2xl text-on-surface flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">info</span>
              Mission Parameters
            </h2>
            <div className="text-slate-300 text-base leading-relaxed space-y-4">
              <p>Duration: {challenge.durationDays} Days</p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-slate-400 marker:text-primary">
                <li>Submit your solution daily before midnight GMT.</li>
                <li>Code must pass all hidden test parameters.</li>
                <li>Missing a cycle resets your streak counter to 0.</li>
              </ul>
            </div>
          </div>

          {/* Submission Area */}
          <div className="bg-surface-container-highest rounded-3xl p-8 lg:p-10 border border-tertiary-container/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-tertiary to-tertiary-container"></div>
            
            <h3 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-fixed">code_blocks</span>
              Current Cycle Deployment
            </h3>
            {isJoined && !hasSubmitted ? (
               <>
                 <textarea 
                   className="input-base w-full min-h-[160px] mb-6 font-mono text-sm leading-relaxed"
                   placeholder="// Input function logic, URL or text submission here..."
                   value={entryText}
                   onChange={e => setEntryText(e.target.value)}
                   disabled={isSubmitting}
                 ></textarea>
                 <div className="flex justify-end">
                   <button 
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className="btn-secondary flex items-center justify-center gap-2 px-8 py-3 bg-tertiary-container/20 text-tertiary hover:bg-tertiary/20 hover:text-tertiary-fixed border-tertiary/20 font-bold transition-all w-full sm:w-auto disabled:opacity-50"
                   >
                     <span className="material-symbols-outlined text-[18px]">publish</span>
                     {isSubmitting ? 'Transmitting...' : 'Transmit Solution'}
                   </button>
                 </div>
               </>
            ) : hasSubmitted ? (
               <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                 <span className="material-symbols-outlined text-4xl text-primary mb-2">mark_email_read</span>
                 <p className="font-headline font-bold text-slate-200">Solution Transmitted</p>
                 <p className="text-sm text-slate-400 mt-1">Your entry has been processed and scored. Waiting for peer reviews.</p>
                 <p className="text-sm text-tertiary font-bold mt-4">Current Score: {participant.score}</p>
               </div>
            ) : (
               <div className="bg-surface-container-highest rounded-2xl p-6 text-center">
                 <p className="text-slate-400 mt-1">You must Engage Mission before resolving.</p>
               </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5">
             <h3 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">analytics</span>
               Personal Telemetry
             </h3>
             <ProgressBar progress={0} label="0 / 7 Cycles Completed" />
          </div>

          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary">format_list_numbered</span>
              Global Leaderboard
            </h3>
            <LeaderboardTable entries={leaderboard || []} onVote={isJoined ? handleVote : null} votingFor={votingFor} currentUserId={user?._id || user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
