import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profileApi';
import { StatusBadge, RoleBadge, ModeBadge } from '../components/common/Badge';
import { ConnectionsModal } from '../components/common/ConnectionsModal';
import toast from 'react-hot-toast';

/* ── Stat Tile ─────────────────────────────────────── */
const StatTile = ({ icon, value, label, colorClass = 'text-primary', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-surface-container-highest p-4 rounded-3xl flex flex-col items-center justify-center border border-outline-variant/10 transition-colors ${onClick ? 'cursor-pointer hover:border-primary/30 hover:bg-surface-container-high' : 'hover:border-primary/30'}`}
  >
    <span className="material-symbols-outlined text-2xl mb-2 text-slate-400">{icon}</span>
    <p className={`font-black text-2xl leading-none font-headline tracking-tight ${colorClass}`}>
      {value}
    </p>
    <p className="text-[10px] mt-2 font-bold font-headline uppercase tracking-[0.2em] text-slate-500">
      {label}
    </p>
  </div>
);

export const PublicProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Get public profile data
      const { data } = await profileApi.getPublicProfile(username);
      setProfileData(data.data);

      // Search for the user to get _id and role easily (because getPublicProfile didn't historically return user._id)
      const res = await profileApi.searchUsers(username);
      const match = res.data.data?.find(u => u.username === username);
      if (match) {
        setTargetUser(match);
        fetchConnections(match._id);
      }
    } catch (error) {
      toast.error('Profile not found or access restricted.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async (targetId) => {
    try {
      const [followersRes, followingRes, statusesRes] = await Promise.all([
        profileApi.getFollowers(targetId),
        // we can't fetch their following without a dedicated route for public following if restricted, 
        // but let's see if we can just get theirs (wait, backend getFollowing only gets MY following currently: req.user._id).
        // Since backend getFollowing is `req.user._id`, we only know the "followers" count of the target.
        // I will fallback followingCount to 0 for now.
        Promise.resolve({ data: { following: [] } }), 
        profileApi.getConnectionStatuses()
      ]);

      const followersList = followersRes.data.followers || [];
      setFollowersCount(followersList.length);
      
      const status = statusesRes.data.statuses?.[targetId] || null;
      setFollowState(status);

    } catch (e) {
      console.error(e);
    }
  };

  const toggleFollow = async () => {
    if (!targetUser) return;
    try {
      if (followState) {
        await profileApi.unfollowUser(targetUser._id);
        if (followState === 'accepted') {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
        setFollowState(null);
        toast.success(`Unfollowed ${targetUser.username}`);
      } else {
        const { data } = await profileApi.followUser(targetUser._id);
        const newStatus = data.message.includes('guardian') ? 'pending' : 'accepted';
        setFollowState(newStatus);
        if (newStatus === 'accepted') {
           setFollowersCount(prev => prev + 1);
        }
        toast.success(data.message || `Successfully followed ${targetUser.username}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const toggleBlock = async () => {
    if (!targetUser) return;
    try {
      if (isBlocked) {
        await profileApi.unfollowUser(targetUser._id); // reuse till we add unblock
        // Actually call block endpoint:
        const api = (await import('../api/axios')).default;
        await api.delete(`/users/block/${targetUser._id}`);
        setIsBlocked(false);
        toast.success(`Unblocked ${targetUser.username}`);
      } else {
        const api = (await import('../api/axios')).default;
        await api.post(`/users/block/${targetUser._id}`);
        setIsBlocked(true);
        setFollowState(null);
        toast.success(`${targetUser.username} blocked`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Block action failed');
    }
  };

  const avatarL = username?.[0]?.toUpperCase() ?? '?';

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter p-6">
      <div className="h-64 bg-surface-container rounded-3xl animate-pulse" />
    </div>
  );

  if (!profileData && !targetUser) return (
    <div className="max-w-4xl mx-auto py-20 text-center">
       <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">person_off</span>
       <h1 className="text-2xl font-headline font-bold text-slate-300">User Not Found</h1>
    </div>
  );

  const { profile, activity } = profileData || {};
  const isMe = currentUser?.username === username;

  return (
    <div className="max-w-4xl mx-auto page-enter py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* ── Back button ── */}
      <div>
        <Link to="/search" className="inline-flex items-center gap-2 text-[11px] font-headline font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors bg-surface-container-highest px-4 py-2 rounded-full hover:bg-primary/10">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
        </Link>
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-surface-container rounded-3xl p-8 lg:p-12 border border-outline-variant/10 group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest bg-surface-container-lowest flex items-center justify-center text-on-surface font-headline font-black text-4xl shadow-[0_0_40px_rgba(173,198,255,0.15)]">
              {profile?.avatar || targetUser?.avatar || targetUser?.oauthAvatarUrl
                ? <img src={profile?.avatar || targetUser?.avatar || targetUser?.oauthAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : avatarL
              }
            </div>
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl font-black text-on-surface font-headline tracking-tighter truncate w-full">
              {profile?.displayName ?? username}
            </h1>
            <p className="text-sm mt-1 text-slate-400 font-medium">
              @{username}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
              {targetUser?.role && <RoleBadge role={targetUser.role} />}
              {targetUser?.status && <StatusBadge status={targetUser.status} />}
            </div>

            {profile?.bio && (
              <p className="text-sm mt-6 leading-relaxed text-slate-300 max-w-xl">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Follow + Block Buttons */}
          {!isMe && currentUser?.role !== 'admin' && targetUser?.role !== 'admin' && (
            <div className="flex flex-col gap-2 shrink-0">
              <button 
                onClick={toggleFollow}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold font-headline text-sm ${
                  followState === 'accepted' ? 'bg-surface-container-highest text-slate-300 hover:text-error hover:bg-error-container/20 border border-outline-variant/20' 
                  : followState === 'pending' ? 'bg-surface-container-highest text-tertiary border border-tertiary/20 opacity-80' 
                  : 'btn-primary shadow-[0_0_20px_rgba(173,198,255,0.2)]'}`}
              >
                <span className="material-symbols-outlined text-sm">{followState ? 'person_remove' : 'person_add'}</span>
                {followState === 'accepted' ? 'Unfollow' : followState === 'pending' ? 'Requested' : 'Follow'}
              </button>
              <button 
                onClick={toggleBlock}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold font-headline text-sm border ${isBlocked ? 'border-primary/20 text-primary hover:bg-primary/10' : 'border-outline-variant/20 text-slate-500 hover:text-error hover:border-error/30 hover:bg-error/5'}`}
              >
                <span className="material-symbols-outlined text-sm">{isBlocked ? 'lock_open' : 'block'}</span>
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile 
          icon="group" 
          value={followersCount} 
          label="Followers" 
          colorClass="text-primary"
          onClick={() => { setModalType('followers'); setModalOpen(true); }}
        />
        <StatTile 
          icon="rss_feed" 
          value={activity?.postCount ?? 0} 
          label="Posts" 
          colorClass="text-slate-200" 
        />
        <StatTile 
          icon="account_circle" 
          value={followingCount} 
          label="Following" 
          colorClass="text-slate-400"
        />
      </div>

      <ConnectionsModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetId={targetUser?._id}
        type={modalType} 
      />
    </div>
  );
};
