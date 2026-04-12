import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { StatusBadge, RoleBadge, ModeBadge } from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

export const DashboardPage = () => {
  const { user, isGuardian, isAdmin } = useAuth();

  return (
    <div className="space-y-8 page-enter max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter">
          Hey, <span className="text-primary">{user?.username}</span> ⚡
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Welcome to your dashboard</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Account Status" value={<StatusBadge status={user?.status} />} />
        <StatCard label="Role" value={<RoleBadge role={user?.role} />} />
        <StatCard label="Mode" value={<ModeBadge mode={user?.mode} />} />
        <StatCard label="Active Sessions" value={
          <span className="font-headline font-black text-primary text-xl">{user?.activeSessions ?? 1}</span>
        } />
      </div>

      <div className="h-px bg-outline-variant/10 my-8 w-full" />

      {/* Account info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container p-8 rounded-3xl space-y-4">
          <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-2">Account Info</h2>
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Username" value={user?.username} />
          <InfoRow label="Email Verified" value={user?.isEmailVerified ? '✅ Yes' : '❌ No'} />
          <InfoRow label="Last Login" value={formatDateTime(user?.lastLoginAt)} />
          {user?.age && <InfoRow label="Age" value={`${user.age} years old`} />}
        </div>

        <div className="bg-surface-container p-8 rounded-3xl space-y-4">
          <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-2">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/change-password" className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-surface-container-highest hover:bg-surface-container-high transition-colors group">
              <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">password</span>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Change Password</p>
                <p className="text-xs text-slate-500">Update your security credentials</p>
              </div>
            </Link>
            {isGuardian && (
              <Link to="/guardian" className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-surface-container-highest hover:bg-surface-container-high transition-colors group">
                <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">admin_panel_settings</span>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Guardian Portal</p>
                  <p className="text-xs text-slate-500">{user?.linkedChildrenCount} linked account{user?.linkedChildrenCount !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors group">
                <span className="material-symbols-outlined text-2xl text-primary transition-colors">security</span>
                <div>
                  <p className="font-headline font-bold text-sm text-primary">Admin Panel</p>
                  <p className="text-xs text-slate-500">Manage users and content</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Child account notice */}
      {user?.role === 'child' && (
        <div className="bg-tertiary-container p-6 rounded-3xl mt-6">
          <h2 className="font-headline font-bold text-lg text-on-tertiary-container mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">gpp_good</span> Youth Account
          </h2>
          <p className="text-on-tertiary-container/80 text-sm font-medium">
            Your privacy settings restrict some features. 
            {user?.guardianId && ' A guardian account is linked to your profile.'}
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-surface-container-low p-6 rounded-3xl flex flex-col items-center justify-center border border-outline-variant/10 text-center">
    <div className="mb-2">{value}</div>
    <p className="text-[10px] text-slate-500 font-headline uppercase tracking-[0.2em]">{label}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
    <span className="text-[10px] text-slate-500 font-headline uppercase tracking-widest">{label}</span>
    <span className="text-sm text-slate-200 font-medium">{value}</span>
  </div>
);
