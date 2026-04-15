import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { guardianApi } from '../../api/guardianApi';
import { Spinner } from '../../components/common/Spinner';

export const GuardianApprovePage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    guardianApi.approveChild(token)
      .then(({ data: d }) => { setData(d); setStatus('success'); })
      .catch((err) => {
        const e = err?.response?.data;
        setError(e?.message || 'Authorization failed');
        setStatus('error');
        if (e?.code === 'GUARDIAN_NOT_REGISTERED') setStatus('not_registered');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative environment */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-container-high p-8 sm:p-10 rounded-[2rem] text-center shadow-2xl border border-outline-variant/10 animate-slide-up relative z-10">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-6">
            <Spinner size="lg" />
            <p className="text-slate-400 mt-6 font-headline font-bold uppercase tracking-widest text-xs animate-pulse">Processing link approval...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-2">
            <div className="w-20 h-20 mx-auto bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">verified</span>
            </div>
            <h2 className="font-headline font-black text-3xl text-on-surface mb-3 tracking-tighter">Link Confirmed</h2>
            <p className="text-slate-400 font-medium mb-4">{data?.message}</p>
            
            {data?.child && (
              <div className="bg-surface-container-highest rounded-xl p-4 mb-6 border border-outline-variant/5">
                <p className="text-[11px] text-slate-500 font-headline font-bold uppercase tracking-widest mb-1">Child Account</p>
                <p className="text-primary font-headline font-black tracking-wide text-lg">{data.child.username}</p>
              </div>
            )}
            
            {data?.guardianCapabilityUnlocked && (
              <div className="p-4 rounded-2xl bg-tertiary-container/20 border border-tertiary/20 mb-8 mt-2">
                <p className="text-tertiary font-headline font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Guardian privileges unlocked
                </p>
              </div>
            )}
            <Link to="/login" className="btn-primary w-full py-4 text-base flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">login</span> Go to Login
            </Link>
          </div>
        )}

        {status === 'not_registered' && (
          <div className="py-2">
            <div className="w-20 h-20 mx-auto bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-orange-400">warning</span>
            </div>
            <h2 className="font-headline font-black text-3xl text-on-surface mb-3 tracking-tighter">Account Not Found</h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">{error}</p>
            <Link to="/register" className="btn-secondary w-full py-4 text-base flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_add</span> Create Account
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-2">
            <div className="w-20 h-20 mx-auto bg-error/10 border border-error/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,180,171,0.2)] text-error">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h2 className="font-headline font-black text-3xl text-on-surface mb-3 tracking-tighter">Authorization Failed</h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">{error}</p>
            <Link to="/login" className="btn-secondary w-full py-4 text-base flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span> Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
