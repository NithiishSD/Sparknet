import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { StatusBadge, RoleBadge, ModeBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['', 'active', 'suspended', 'banned', 'pending_verification', 'pending_guardian_approval'];
const ROLES = ['', 'user', 'child', 'admin'];

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', status: '', isGuardian: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.isGuardian) params.isGuardian = 'true';
      const { data } = await adminApi.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, filters.role, filters.status, filters.isGuardian]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters.role, filters.status, filters.isGuardian]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setFilter = (f) => (e) => setFilters({ ...filters, [f]: e.target.value });

  return (
    <div className="space-y-8 page-enter py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
            User Directory
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Tracking {total} registered users</p>
        </div>
        <Link to="/admin" className="btn-secondary py-2 px-4 shadow-sm flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Admin Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/5 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-center">
        <div className="relative flex-1 w-full md:min-w-[200px]">
          <input
            type="text"
            placeholder="Search username or email..."
            value={filters.search}
            onChange={setFilter('search')}
            className="input-base w-full pl-11"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
        </div>
        <select value={filters.role} onChange={setFilter('role')} className="input-base w-full md:w-auto min-w-[140px]">
          {ROLES.map(r => <option key={r} value={r}>{r ? r.toUpperCase() : 'ALL ROLES'}</option>)}
        </select>
        <select value={filters.status} onChange={setFilter('status')} className="input-base w-full md:w-auto min-w-[160px]">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g,' ').toUpperCase() : 'ALL STATUSES'}</option>)}
        </select>
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-surface-container-highest border border-outline-variant/10 hover:border-outline-variant/30 transition-all w-full md:w-auto h-full">
          <div className="relative">
            <input type="checkbox" checked={!!filters.isGuardian} onChange={(e) => setFilters({ ...filters, isGuardian: e.target.checked })} className="peer sr-only" />
            <div className="w-10 h-5 bg-surface-container rounded-full peer peer-checked:bg-primary transition-colors border border-outline-variant/20 shadow-inner"></div>
            <div className="absolute left-1 top-[2px] bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow"></div>
          </div>
          <span className="text-[11px] font-headline font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Guardians Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/10 shadow-lg">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container">
             <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 opacity-50">person_off</span>
             <p className="text-slate-400 font-medium font-headline tracking-wide">No users match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-highest">
                  {['User', 'Role', 'Status', 'Mode', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-[11px] font-headline font-bold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-surface-container-high transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-sm font-headline font-black text-slate-300 shadow-inner group-hover:border-primary/20 transition-colors">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-headline font-bold text-base text-on-surface tracking-wide">{u.username}</p>
                          <p className="text-[11px] text-slate-500 font-headline uppercase tracking-widest font-bold">{u.email}</p>
                          {u.isGuardian && <span className="text-[10px] text-tertiary font-headline font-bold uppercase tracking-widest mt-1 block">⚡ Guardian ({u.linkedChildrenCount})</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-4"><ModeBadge mode={u.mode} /></td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-headline font-bold whitespace-nowrap">{formatDateTime(u.lastLoginAt)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/users/${u._id}`} className="btn-secondary py-1.5 px-4 text-[10px] bg-surface-container-highest border-outline-variant/10">
                        View Details <span className="material-symbols-outlined text-[12px] ml-1">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[11px] text-slate-500 font-headline font-bold uppercase tracking-widest">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 px-4 disabled:opacity-30 flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px]">chevron_left</span> Prev
            </button>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 px-4 disabled:opacity-30 flex items-center gap-2">
               Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
