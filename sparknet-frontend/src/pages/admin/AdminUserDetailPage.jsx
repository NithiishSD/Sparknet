import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { StatusBadge, RoleBadge, ModeBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['active', 'suspended', 'banned', 'pending_verification', 'pending_guardian_approval'];
const MODES = ['normal', 'youth'];

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [modal, setModal] = useState(null); // { type, value }
  const [reason, setReason] = useState('');

  const fetchUser = async () => {
    try {
      const [{ data: u }, { data: a }] = await Promise.all([
        adminApi.getUser(id),
        adminApi.getUserActivity(id),
      ]);
      setUser(u.user);
      setActivity(a.activity);
    } catch { toast.error('Failed to load user profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleStatusChange = async () => {
    try {
      await adminApi.updateUserStatus(id, modal.value, reason);
      toast.success(`Status updated to ${modal.value}`);
      setModal(null);
      setReason('');
      fetchUser();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleModeChange = async (mode) => {
    try {
      await adminApi.setUserMode(id, mode);
      toast.success(`User mode updated to ${mode}`);
      fetchUser();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleForceLogout = async () => {
    try {
      await adminApi.forceLogout(id);
      toast.success('User has been forcefully logged out');
      fetchUser();
    } catch { toast.error('Logout failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <div className="text-center py-20 text-slate-500 font-headline uppercase tracking-widest font-bold">User profile unavailable</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-enter py-8 px-4 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-2xl w-fit border border-outline-variant/10 shadow-sm leading-none">
        <Link to="/admin" className="text-slate-500 hover:text-primary transition-colors text-[11px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">local_police</span>
          Dashboard
        </Link>
        <span className="text-slate-600 font-bold">/</span>
        <Link to="/admin/users" className="text-slate-500 hover:text-primary transition-colors text-[11px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
          Users
        </Link>
        <span className="text-slate-600 font-bold">/</span>
        <span className="text-slate-300 font-headline font-black tracking-wide bg-surface-container px-3 py-1 rounded-lg border border-outline-variant/10">{user.username}</span>
      </div>

      {/* Header */}
      <div className="bg-surface-container rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden border border-outline-variant/10 shadow-lg relative">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-3xl font-headline font-black text-slate-300 shadow-inner shrink-0">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
               <h1 className="font-headline font-black text-3xl text-on-surface tracking-wide">{user.username}</h1>
               <p className="text-slate-400 font-headline uppercase tracking-widest font-bold text-sm md:border-l md:border-outline-variant/20 md:pl-4">{user.email}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4 w-full">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
              <ModeBadge mode={user.mode} />
              {user.isGuardian && <span className="text-[10px] text-tertiary bg-tertiary-container/10 border border-tertiary/20 px-3 py-1 rounded-full font-headline font-bold uppercase tracking-widest">⚡ Guardian ({user.linkedChildrenCount})</span>}
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto relative z-10 shrink-0">
            <button onClick={handleForceLogout} className="btn-secondary w-full md:w-auto py-3 px-6 bg-error/10 text-error hover:bg-error hover:text-on-error border-error/20 flex justify-center items-center gap-2 font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(255,180,171,0.1)] hover:shadow-[0_0_20px_rgba(255,180,171,0.3)]">
              <span className="material-symbols-outlined text-[18px]">power_off</span>
              Force Logout
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-surface-container-highest rounded-2xl border border-outline-variant/10 w-full md:w-fit shadow-inner">
        {['info', 'actions', 'activity'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl font-headline font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap focus:outline-none flex-1 md:flex-auto ${tab === t ? 'bg-primary text-on-primary shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-container-high'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/5 shadow-sm space-y-0 h-fit">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_circle</span>
              User Details
            </h3>
            {[
              ['Identifier', <span className="font-headline font-bold text-slate-300 text-[11px] bg-surface-container-highest px-3 py-1 rounded-md">{user._id}</span>],
              ['Authentication Status', user.isEmailVerified ? <span className="text-emerald-400 font-bold">Verified</span> : <span className="text-error font-bold">Unverified</span>],
              ['Access Attempts', <span className="text-primary font-bold">{user.loginAttempts}</span>],
              ['Last Login', formatDateTime(user.lastLoginAt)],
              ['Registered', formatDateTime(user.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-4 border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-high px-2 rounded-lg transition-colors">
                <span className="text-[11px] text-slate-500 font-headline uppercase font-bold tracking-widest">{label}</span>
                <span className="text-sm text-slate-200">{value}</span>
              </div>
            ))}
          </div>

          {user.isGuardian && user.childLinks?.length > 0 && (
            <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/5 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">family_restroom</span>
                Managed Youth Users
              </h3>
              <div className="space-y-3">
                {user.childLinks.map((link) => (
                  <div key={link._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors gap-3">
                    <div>
                      <p className="font-headline font-bold text-base text-on-surface tracking-wide">{link.childId?.username}</p>
                      <p className="text-[11px] text-slate-500 font-headline uppercase font-bold tracking-widest mt-1">{link.childId?.email}</p>
                    </div>
                    <StatusBadge status={link.childId?.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Actions */}
      {tab === 'actions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/5 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">gavel</span>
              Change Status
            </h3>
            <div className="space-y-3">
              {STATUSES.map(s => (
                <button key={s} disabled={user.status === s}
                  onClick={() => setModal({ type: 'status', value: s })}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-headline font-bold transition-all border flex items-center justify-between
                    ${user.status === s
                      ? 'bg-primary/10 border-primary/30 text-primary cursor-default'
                      : 'bg-surface-container-highest border-outline-variant/10 text-slate-300 hover:border-outline-variant/40 hover:text-white hover:bg-surface-container-high'}`}>
                  <span className="tracking-wide uppercase text-[11px] font-black">{s.replace(/_/g,' ')}</span>
                  {s === user.status && <span className="material-symbols-outlined text-[18px]">verified</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/5 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-secondary">tune</span>
               User Mode
            </h3>
            <div className="space-y-3">
              {MODES.map(m => (
                <button key={m} disabled={user.mode === m}
                  onClick={() => handleModeChange(m)}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-headline font-bold transition-all border flex items-center justify-between
                    ${user.mode === m
                      ? 'bg-secondary/10 border-secondary/30 text-secondary cursor-default'
                      : 'bg-surface-container-highest border-outline-variant/10 text-slate-300 hover:border-outline-variant/40 hover:text-white hover:bg-surface-container-high'}`}>
                  <span className="tracking-wide uppercase text-[11px] font-black">{m}</span>
                  {m === user.mode && <span className="material-symbols-outlined text-[18px]">verified</span>}
                </button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-surface-container-highest border border-outline-variant/10 rounded-2xl flex items-start gap-3">
               <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 mt-0.5">info</span>
               <p className="text-[11px] text-slate-500 font-headline uppercase font-bold tracking-widest leading-relaxed">System Note: Modifying operational protocol directives will force-sever all active connection sessions for this node.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Activity */}
      {tab === 'activity' && activity && (
        <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/5 shadow-lg animate-slide-up">
          <div className="px-6 md:px-8 py-6 border-b border-outline-variant/10 bg-surface-container-highest flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                 Terminal Access Telemetry
              </h2>
            </div>
            <div className="bg-surface-container px-4 py-2 border border-outline-variant/5 rounded-xl block w-fit">
              <span className="text-[11px] font-headline font-bold text-slate-500 uppercase tracking-widest">Active Links: </span>
              <span className="text-primary font-bold">{activity.activeSessions?.length || 0}</span>
            </div>
          </div>
          <div className="divide-y divide-outline-variant/5">
            {activity.loginHistory?.length === 0 && (
              <div className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 opacity-50">search_off</span>
                <p className="text-slate-400 text-sm font-medium">No recorded access actions.</p>
              </div>
            )}
            {[...(activity.loginHistory || [])].reverse().map((entry, i) => (
              <div key={i} className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-high transition-colors group">
                <div className="flex items-center gap-5">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 shadow-inner ${entry.success ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]'}`} />
                  <div>
                    <p className="text-sm text-slate-300 font-headline font-bold bg-surface-container-highest border border-outline-variant/5 px-2 py-0.5 rounded w-fit tracking-wider">{entry.ip}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-md mt-1.5 font-medium group-hover:text-slate-400 transition-colors uppercase tracking-wider">{entry.device}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right pl-8 sm:pl-0">
                  <p className={`text-[11px] font-headline font-black uppercase tracking-widest ${entry.success ? 'text-emerald-400' : 'text-error'}`}>
                    {entry.success ? 'Authorized' : 'Rejected'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-headline font-bold mt-1.5">{formatDateTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status change modal */}
      {modal?.type === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="relative bg-surface rounded-[2rem] border border-outline-variant/10 p-8 w-full max-w-md animate-slide-up shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-headline font-black text-2xl text-on-surface tracking-tighter">
                Mutate State
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white transition-colors bg-surface-container-highest w-8 h-8 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/10 mb-8 flex flex-col">
               <span className="text-[10px] uppercase font-headline font-bold tracking-widest text-slate-500 mb-1">Target State</span>
               <span className="text-primary font-headline font-black text-lg tracking-wide uppercase">{modal.value.replace(/_/g,' ')}</span>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[11px] text-slate-400 font-headline font-bold uppercase tracking-widest ml-1">Directive Reason (Optional)</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide contextual log..." rows={3} className="input-base w-full resize-none" />
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setModal(null)} className="btn-secondary py-3.5 flex-1 shadow-sm">Cancel</button>
              <button onClick={handleStatusChange} className="btn-primary py-3.5 flex-1 shadow-[0_0_15px_rgba(173,198,255,0.2)]">Execute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
