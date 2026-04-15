import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { guardianApi } from '../../api/guardianApi';
import { StatusBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const ChildActivityPage = () => {
  const { childId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guardianApi.getChildActivity(childId)
      .then(({ data }) => setActivity(data.activity))
      .catch(() => toast.error('Failed to load activity log'))
      .finally(() => setLoading(false));
  }, [childId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!activity) return <div className="text-center py-20 text-slate-500 font-headline uppercase tracking-widest font-bold">Activity log unavailable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter py-8 px-4 sm:px-6">
      <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-2xl w-fit border border-outline-variant/10 shadow-sm">
        <Link to="/guardian" className="text-slate-500 hover:text-primary transition-colors text-[11px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Guardian Dashboard
        </Link>
        <span className="text-slate-600 font-bold">/</span>
        <span className="text-slate-300 font-headline font-black tracking-wide bg-surface-container px-3 py-1 rounded-lg border border-outline-variant/10">{activity.username}</span>
      </div>

      <div className="pt-4 border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline font-black text-3xl text-on-surface tracking-tighter flex items-center gap-3">
           <span className="material-symbols-outlined text-primary text-3xl">insights</span>
           {activity.username} Activity Log
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Session monitoring & login history logs</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Account Status" value={<StatusBadge status={activity.status} />} />
        <StatCard 
          label="Active Sessions" 
          value={<span className="font-headline font-black text-primary text-xl drop-shadow-[0_0_8px_rgba(173,198,255,0.4)]">{activity.activeSessions}</span>} 
        />
        <StatCard 
          label="Last Login" 
          value={<span className="text-xs text-slate-300 font-headline font-bold">{formatDateTime(activity.lastLoginAt)}</span>} 
        />
        <StatCard 
          label="Origin IP" 
          value={<span className="text-xs text-slate-300 font-headline font-bold bg-surface-container-highest px-2 py-1 rounded-md">{activity.lastLoginIp || '—'}</span>} 
        />
      </div>

      {/* Login history */}
      <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/10 shadow-lg mt-6">
        <div className="px-6 md:px-8 py-5 border-b border-outline-variant/10 bg-surface-container-highest">
          <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Login History
          </h2>
          <p className="text-[11px] text-slate-500 font-headline font-bold uppercase tracking-widest mt-1">Last 30 recorded logins</p>
        </div>
        <div className="divide-y divide-outline-variant/5">
          {activity.loginHistory?.length === 0 && (
            <div className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 opacity-50">search_off</span>
              <p className="text-slate-400 text-sm font-medium">No login history found.</p>
            </div>
          )}
          {[...activity.loginHistory].reverse().map((entry, i) => (
            <div key={i} className="px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-high transition-colors group">
              <div className="flex items-center gap-4">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-inner ${entry.success ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]'}`} />
                <div>
                  <p className="text-sm text-slate-300 font-headline font-bold bg-surface-container-highest px-2 py-0.5 rounded border border-outline-variant/5 w-fit">{entry.ip}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs mt-1 font-medium group-hover:text-slate-400 transition-colors">{entry.device}</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-6 sm:pl-0">
                <p className={`text-[11px] font-headline font-black uppercase tracking-widest ${entry.success ? 'text-emerald-400' : 'text-error'}`}>
                  {entry.success ? 'Success' : 'Failed'}
                </p>
                <p className="text-[11px] text-slate-500 font-headline font-bold mt-1 max-w-[150px]">{formatDateTime(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-surface-container p-5 rounded-3xl border border-outline-variant/5 hover:border-outline-variant/20 hover:bg-surface-container-high transition-colors text-center flex flex-col justify-center items-center shadow-sm">
    <p className="text-[10px] text-slate-500 font-headline font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
      {label}
    </p>
    <div className="flex justify-center items-center h-full">{value}</div>
  </div>
);
