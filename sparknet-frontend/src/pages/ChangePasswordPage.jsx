import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.changePassword(form);
      toast.success(data.message || 'Cipher updated. Re-authenticating required.');
      await logout();
      navigate('/login');
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors) errData.errors.forEach((e) => toast.error(e));
      else toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto page-enter py-12 px-4 sm:px-6">
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/10 shrink-0 text-primary shadow-[0_0_20px_rgba(173,198,255,0.1)]">
          <span className="material-symbols-outlined text-3xl">key</span>
        </div>
        <div>
          <h1 className="font-headline font-black text-3xl text-on-surface tracking-tighter">Update Cipher</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Security credentials refresh</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-error/5 blur-3xl rounded-full pointer-events-none"></div>
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <Input label="Current Cipher" type="password" placeholder="••••••••" value={form.currentPassword} onChange={set('currentPassword')} required />
            <Input label="New Cipher" type="password" placeholder="••••••••" value={form.newPassword} onChange={set('newPassword')} required minLength={8} />
          </div>
          
          <div className="bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">info</span>
            <p className="text-[11px] text-slate-400 font-headline uppercase tracking-widest leading-relaxed">
              Requirements: Minimal 8 length, containing 1 numeric, 1 alphabet block, and 1 non-alphanumeric character.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-4">
            {loading ? <><Spinner /> Processing...</> : <><span className="material-symbols-outlined text-[18px]">sync_lock</span> Execute Update</>}
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-slate-500 font-medium mt-6">
        Session will terminate upon successful update.
      </p>
    </div>
  );
};
