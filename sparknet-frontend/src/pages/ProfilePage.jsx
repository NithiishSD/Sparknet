import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profileApi';
import { StatusBadge, RoleBadge, ModeBadge } from '../components/common/Badge';
import { ConnectionsModal } from '../components/common/ConnectionsModal';
import { formatDateTime } from '../utils/helpers';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ── Stat Tile ─────────────────────────────────────── */
const StatTile = ({ icon, value, label, colorClass = 'text-primary', onClick }) => (
  <div onClick={onClick} className={`bg-surface-container-highest p-4 rounded-3xl flex flex-col items-center justify-center border border-outline-variant/10 transition-colors ${onClick ? 'cursor-pointer hover:border-primary/30 hover:bg-surface-container-high' : 'hover:border-primary/30'}`}>
    <span className="material-symbols-outlined text-2xl mb-2 text-slate-400">{icon}</span>
    <p className={`font-black text-2xl leading-none font-headline tracking-tight ${colorClass}`}>
      {value}
    </p>
    <p className="text-[10px] mt-2 font-bold font-headline uppercase tracking-[0.2em] text-slate-500">
      {label}
    </p>
  </div>
);

/* ── Info Row ──────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
    <span className="text-[10px] text-slate-500 font-headline uppercase tracking-widest">
      {label}
    </span>
    <span className="text-sm text-slate-200 font-medium whitespace-nowrap">
      {value}
    </span>
  </div>
);

/* ── Quick Action Link ─────────────────────────────── */
const QuickAction = ({ to, icon, label, sub, primary = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
      primary ? 'bg-primary/10 hover:bg-primary/20' : 'bg-surface-container-highest hover:bg-surface-container-high'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
      primary ? 'bg-primary/20 text-primary group-hover:scale-110' : 'bg-surface-container-lowest text-slate-400 group-hover:text-primary group-hover:scale-110'
    }`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <div className="flex-1">
      <p className={`font-headline font-bold text-sm ${primary ? 'text-primary' : 'text-slate-200 group-hover:text-primary'}`}>
        {label}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
    <span className={`material-symbols-outlined transition-transform group-hover:translate-x-1 ${primary ? 'text-primary opacity-80' : 'text-slate-600'}`}>
      chevron_right
    </span>
  </Link>
);

/* ── Main Page ─────────────────────────────────────── */
export const ProfilePage = () => {
  const { user, isGuardian, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('followers');

  useEffect(() => {
    profileApi.getMyProfile()
      .then(({ data }) => setProfileData(data.data))
      .catch(() => toast.error('Failed to sync profile'))
      .finally(() => setLoading(false));

    if (user?._id) {
      profileApi.getFollowers(user._id).then(res => setFollowersCount(res.data.followers?.length || 0)).catch(console.error);
      profileApi.getFollowing().then(res => setFollowingCount(res.data.following?.length || 0)).catch(console.error);
    }
  }, [user]);

  const { profile, activity, privacy } = profileData ?? {};
  const avatarL = user?.username?.[0]?.toUpperCase() ?? '?';

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter p-6">
      <div className="h-64 bg-surface-container rounded-3xl animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-container rounded-3xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto page-enter py-8 px-4 sm:px-6 flex flex-col gap-8">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-surface-container rounded-3xl p-8 lg:p-12 border border-outline-variant/10 group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-container/5 rounded-full blur-3xl group-hover:bg-tertiary-container/10 transition-colors duration-1000 translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest bg-surface-container-lowest flex items-center justify-center text-on-surface font-headline font-black text-4xl shadow-[0_0_40px_rgba(173,198,255,0.15)]">
              {profile?.avatar
                ? <img src={`${import.meta.env.VITE_API_URL ?? ''}${profile.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                : (user?.oauthAvatarUrl
                    ? <img src={user.oauthAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : avatarL)
              }
            </div>
            {user?.isEmailVerified && (
              <span className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-surface-container border-4 border-surface-container flex items-center justify-center text-primary" title="Verified">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
            )}
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl font-black text-on-surface font-headline tracking-tighter truncate w-full">
              {profile?.displayName ?? user?.username}
            </h1>
            <p className="text-sm mt-1 text-slate-400 font-medium">
              ID: {user?.username}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
              <RoleBadge   role={user?.role}   />
              <StatusBadge status={user?.status} />
              <ModeBadge   mode={user?.mode}   />
              {isGuardian && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-tertiary-container/20 text-tertiary font-headline border border-tertiary/20">
                  Guardian
                </span>
              )}
            </div>

            {profile?.bio && (
              <p className="text-sm mt-6 leading-relaxed text-slate-300 max-w-xl">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <Link to="/edit-profile" className="btn-secondary shrink-0 shrink flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            Modify
          </Link>
        </div>

        {/* Welcome greeting */}
        <div className="relative z-10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/10 text-center sm:text-left">
          <p className="text-lg font-bold text-slate-300 font-headline">
            Status: <span className="text-primary pulse-dot inline-block ml-1 mr-2 mb-1 w-2 h-2 rounded-full"></span> Active uplink.
          </p>
          <p className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold">
            Last sync: {formatDateTime(user?.lastLoginAt) || '—'}
          </p>
        </div>
      </div>

      {/* ── Child account notice ── */}
      {user?.role === 'child' && (
        <div className="bg-tertiary-container p-6 rounded-3xl flex items-start gap-4 shadow-xl">
          <span className="material-symbols-outlined text-tertiary text-3xl shrink-0">gpp_good</span>
          <div>
            <h3 className="font-bold text-on-tertiary-container text-lg font-headline tracking-tight mb-1">
              Telemetry Restricted
            </h3>
            <p className="text-sm text-on-tertiary-container/80 font-medium">
              Your profile is designated as a Youth Node. 
              {user?.guardianId ? ' A guardian is supervising this link.' : ' Request a guardian to initialize link.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile 
          icon="group"        
          value={followersCount}    
          label="Followers"  
          colorClass="text-primary" 
          onClick={() => { setModalType('followers'); setModalOpen(true); }}
        />
        <StatTile icon="payments"    value={user?.points ?? 0}            label="Credits"    colorClass="text-tertiary-fixed" />
        <StatTile icon="feed"        value={activity?.postCount ?? 0}     label="Broadcasts" colorClass="text-slate-200" />
        <StatTile 
          icon="account_circle" 
          value={followingCount}      
          label="Following" 
          colorClass="text-slate-400"
          onClick={() => { setModalType('following'); setModalOpen(true); }}
        />
      </div>

      {/* ── Interests ── */}
      {profile?.interests?.length > 0 && (
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5 text-center sm:text-left">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-6 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
            <span className="material-symbols-outlined text-primary text-sm">stars</span>
            Signal Signatures
          </h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {profile.interests.map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-surface-container-highest text-[11px] font-headline uppercase tracking-widest text-slate-300 rounded-full hover:bg-primary/20 hover:text-primary transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Account Details ── */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">folder_open</span>
            Core Data
          </h2>
          <div className="space-y-1">
            <InfoRow label="Routing Email"    value={user?.email} />
            <InfoRow label="Verification" value={user?.isEmailVerified
              ? <span className="text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Authentic</span>
              : <span className="text-error flex items-center gap-1"><span className="material-symbols-outlined text-sm">cancel</span> Pending</span>} />
            <InfoRow label="Auth Method"     value={<span className="capitalize">{user?.authProvider ?? 'local'}</span>} />
            <InfoRow label="Visibility" value={<span className="text-primary capitalize">{privacy?.profileVisibility ?? 'public'} stream</span>} />
            {user?.age &&
              <InfoRow label="Lifecycle"    value={`${user.age} cycles`} />}
            {isGuardian &&
              <InfoRow label="Child Nodes" value={<span className="text-tertiary font-bold">{user?.linkedChildrenCount ?? 0}</span>} />}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">bolt</span>
            System Modules
          </h2>
          <div className="space-y-3">
            <QuickAction to="/edit-profile"      icon="manage_accounts"  label="Modify Config"      sub="Update visual and bio data" />
            <QuickAction to="/change-password"   icon="password"         label="Cypher Update"      sub="Regenerate security keys" />
            <QuickAction to="/settings"          icon="settings"         label="System Preferences" sub="Notifications & privacy protocols" />
            {isGuardian && (
              <QuickAction to="/guardian" icon="admin_panel_settings" label="Guardian Override" sub={`${user?.linkedChildrenCount} active child node(s)`} primary />
            )}
            {isAdmin && (
              <QuickAction to="/admin" icon="security" label="Admin Terminal" sub="Global platform administration" primary />
            )}
          </div>
        </div>
      </div>

      <ConnectionsModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetId={user?._id}
        type={modalType} 
      />
    </div>
  );
};
