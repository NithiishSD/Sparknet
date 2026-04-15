import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { Spinner } from '../../components/common/Spinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [modQueue, setModQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    adminApi.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Failed to access telemetry'))
      .finally(() => setLoading(false));
    
    api.get('/admin/reports').then(({ data }) => setReports(data.reports || data.data || [])).catch(() => {});
    api.get('/moderation/queue').then(({ data }) => setModQueue(data.queue || data.data || [])).catch(() => {});
  }, []);

  const resolveReport = async (reportId) => {
    try {
      await api.patch(`/admin/reports/${reportId}/resolve`, { action: 'approved' });
      setReports(prev => prev.filter(r => r._id !== reportId));
      toast.success('Report resolved');
    } catch { toast.error('Failed to resolve report'); }
  };

  const resolveMod = async (postId) => {
    try {
      await api.patch(`/moderation/${postId}/resolve`, { action: 'approved' });
      setModQueue(prev => prev.filter(p => p._id !== postId));
      toast.success('Moderation item resolved');
    } catch { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 page-enter py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-primary to-tertiary text-4xl">local_police</span>
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Platform statistics and user management</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {['overview', 'reports', 'moderation'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold font-headline uppercase tracking-widest transition-all ${
              activeTab === t ? 'bg-primary text-on-primary' : 'bg-surface-container text-slate-400 hover:text-primary hover:bg-primary/10'
            }`}
          >
            {t}
            {t === 'reports' && reports.length > 0 && (
              <span className="ml-2 bg-error text-white text-[9px] px-1.5 py-0.5 rounded-full">{reports.length}</span>
            )}
            {t === 'moderation' && modQueue.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{modQueue.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Total Users" value={stats?.totalUsers} color="text-primary bg-primary/10 border-primary/20" icon="public" iconColor="text-primary" />
            <StatCard label="Youth Users" value={stats?.totalChildren} color="text-tertiary bg-tertiary/10 border-tertiary/20" icon="child_care" iconColor="text-tertiary" />
            <StatCard label="Guardians" value={stats?.guardians} color="text-slate-300 bg-surface-container-highest border-outline-variant/20" icon="admin_panel_settings" iconColor="text-slate-400" />
            <StatCard label="Active Users" value={stats?.activeUsers} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" icon="check_circle" iconColor="text-emerald-400" />
            <StatCard label="Suspended" value={stats?.bannedUsers} color="text-error bg-error/10 border-error/20" icon="block" iconColor="text-error" />
            <StatCard label="Youth Mode Users" value={stats?.youthModeUsers} color="text-purple-400 bg-purple-500/10 border-purple-500/20" icon="shield_lock" iconColor="text-purple-400" />
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent my-8" />

          {/* Quick links */}
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">view_quilt</span>
              Management & Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/admin/users" className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-high transition-all shadow-sm group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg text-slate-200 group-hover:text-primary transition-colors">User Directory</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">View, filter, and manage user accounts</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div>
          <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">flag</span>
            Reported Content ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-surface-container rounded-3xl border border-outline-variant/5">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">check_circle</span>
              <p className="text-slate-400">No pending reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report._id} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-error/10 text-error">{report.category || 'Report'}</span>
                      <span className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{report.reason || report.description}</p>
                    {report.reportedBy && <p className="text-xs text-slate-500 mt-1">Reported by: {report.reportedBy?.username || report.reportedBy}</p>}
                  </div>
                  <button
                    onClick={() => resolveReport(report._id)}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold font-headline hover:bg-primary/20 transition-colors shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div>
          <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">gavel</span>
            Moderation Queue ({modQueue.length})
          </h2>
          {modQueue.length === 0 ? (
            <div className="text-center py-12 bg-surface-container rounded-3xl border border-outline-variant/5">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">check_circle</span>
              <p className="text-slate-400">Moderation queue is clear</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modQueue.map(item => (
                <div key={item._id} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-orange-400/10 text-orange-400">Flagged</span>
                      <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{item.content_text || item.content}</p>
                    {item.user && <p className="text-xs text-slate-500 mt-1">By: {item.user?.username}</p>}
                  </div>
                  <button
                    onClick={() => resolveMod(item._id)}
                    className="px-4 py-2 rounded-xl bg-orange-400/10 text-orange-400 text-xs font-bold font-headline hover:bg-orange-400/20 transition-colors shrink-0"
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, icon, iconColor }) => (
  <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5 shadow-sm hover:border-outline-variant/20 hover:bg-surface-container-high transition-colors group relative overflow-hidden">
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none ${color.split(' ')[1]}`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] text-slate-500 font-headline uppercase font-bold tracking-widest leading-tight w-2/3">{label}</p>
        <p className={`font-headline font-black text-3xl mt-3 drop-shadow-sm ${color.split(' ')[0]}`}>{value ?? '—'}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <span className={`material-symbols-outlined text-[24px] ${iconColor}`}>{icon}</span>
      </div>
    </div>
  </div>
);
