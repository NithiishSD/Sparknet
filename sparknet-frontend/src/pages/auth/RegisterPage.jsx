import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', dateOfBirth: '',
    guardianEmail: '', termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const age = calcAge(form.dateOfBirth);
  const isMinor = age !== null && age < 18;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.termsAccepted) { toast.error('You must accept the terms to continue'); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!isMinor) delete payload.guardianEmail;
      const { data } = await authApi.signup(payload);
      toast.success(data.message, { duration: 6000 });
      navigate('/login');
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors) {
        errData.errors.forEach((e) => toast.error(e));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up pt-8 pb-12">
      <div className="bg-surface-container p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden">
        
        {/* Decorative ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary-container/10 rounded-full blur-[60px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

        <div className="mb-10 text-center relative z-10">
           <div className="w-16 h-16 mx-auto bg-surface-container-highest border border-outline-variant/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl -rotate-3">
             <span className="material-symbols-outlined text-4xl text-primary font-light" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person_add</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-on-surface tracking-tighter mb-2">Sign Up</h1>
          <p className="text-slate-500 text-sm font-medium">Create your SparkNet account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input label="Username" type="text" placeholder="john_doe" value={form.username} onChange={set('username')} required minLength={3} maxLength={30} />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />

          <div className="space-y-2 flex flex-col">
            <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest block font-bold">Password</label>
            <div className="relative group">
              <input type={showPw ? 'text' : 'password'} placeholder="Min 8 chars" value={form.password} onChange={set('password')} required minLength={8} className="input-base w-full pr-14" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary p-2 rounded-lg transition-colors focus:outline-none">
                <span className="material-symbols-outlined text-[18px]">
                  {showPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-headline uppercase tracking-wide mt-1 pl-1">Minimal 8 chars: 1 uppercase, 1 numeric, 1 special</p>
          </div>

          <div className="space-y-2">
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required max={new Date().toISOString().split('T')[0]} />
            {age !== null && (
              <p className={`text-[11px] font-headline uppercase tracking-widest font-bold px-2 py-1.5 rounded-lg inline-block border ${isMinor ? 'text-tertiary bg-tertiary/10 border-tertiary/20' : 'text-primary bg-primary/10 border-primary/20'}`}>
                Age: {age} — {isMinor ? 'Minor Account (Guardian Req.)' : 'Standard Account'}
              </p>
            )}
          </div>

          {isMinor && (
            <div className="p-5 rounded-2xl bg-tertiary-container/20 border border-tertiary/20 space-y-4 shadow-inner">
              <p className="text-[11px] text-tertiary font-headline uppercase tracking-widest font-bold flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Youth privacy restrictions apply
              </p>
              <Input label="Guardian Email" type="email" placeholder="guardian@example.com" value={form.guardianEmail} onChange={set('guardianEmail')} required={isMinor} />
            </div>
          )}

          <label className="flex items-start gap-4 cursor-pointer group bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
            <input type="checkbox" checked={form.termsAccepted} onChange={set('termsAccepted')} className="mt-0.5 accent-primary w-5 h-5 rounded border-outline-variant focus:ring-primary/20" />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium leading-relaxed">
              I acknowledge the{' '}
              <span className="text-primary hover:text-primary-variant underline decoration-primary/30 transition-colors cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary hover:text-primary-variant underline decoration-primary/30 transition-colors cursor-pointer">Privacy Policy</span>
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-4 flex justify-center items-center gap-2">
            {loading ? <><Spinner /> Registering...</> : <><span className="material-symbols-outlined text-[20px]">person_add</span> Sign Up</>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-variant font-headline font-bold ml-1 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};
