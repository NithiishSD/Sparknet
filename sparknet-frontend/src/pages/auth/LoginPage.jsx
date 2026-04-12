import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OnboardingPage from './onboarding';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { getErrorMessage } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login, fetchMe, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/feed';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      const code = err?.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first.', { duration: 5000 });
      } else if (code === 'PENDING_GUARDIAN_APPROVAL') {
        toast.error('Your account is awaiting guardian approval.', { duration: 5000 });
      } else if (code === 'ACCOUNT_LOCKED') {
        toast.error(msg, { duration: 8000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };


  // This simple function now starts the flow.
  const handleGoogleLogin = () => {
    setGoogleLoading(true);

    // Point this EXACTLY to your backend route that triggers Passport
    const backendUrl = import.meta.env.VITE_API_URL || 'https://sparknet-backend.onrender.com';
    window.location.href = `${backendUrl}/api/oauth/google`;
  };


  // OAuth redirect — backend now sets httpOnly cookies, no ?token= in URL.
  // fetchMe() is called automatically by AuthContext on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) {
      // Backward compat: if token somehow arrives, clean the URL silently
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);

  return (
    <div className="w-full max-w-md animate-slide-up mx-auto pt-8 pb-12">
      <div className="bg-surface-container p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="mb-10 text-center relative z-10">
          <div className="w-16 h-16 mx-auto bg-surface-container-highest border border-outline-variant/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl rotate-3">
             <span className="material-symbols-outlined text-4xl text-primary font-light" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>data_object</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-on-surface tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm font-medium">Log in to your account</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-8 relative z-10">
          <button
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 focus:ring-4 focus:ring-white/20 text-slate-900 font-headline font-bold text-sm transition-all duration-300 disabled:opacity-50"
          >
            {googleLoading ? <Spinner /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="h-px bg-outline-variant/20 flex-1" />
          <span className="text-slate-500 text-[10px] font-headline font-bold uppercase tracking-widest">or login with email</span>
          <div className="h-px bg-outline-variant/20 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoFocus
          />
          <div className="space-y-2">
            <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest block font-bold mb-2">Password</label>
            <div className="relative group">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="input-base w-full pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary p-2 rounded-lg transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link to="/forgot-password" className="text-[11px] text-primary hover:text-primary-variant font-headline uppercase tracking-widest font-bold transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2 flex items-center justify-center gap-2">
            {loading ? <><Spinner /> Logging in...</> : <><span className="material-symbols-outlined text-[20px]">login</span> Login</>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-variant font-headline font-bold ml-1 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>

      <div className="mt-8 text-center animate-fade-in">
        <Link to="/resend-verification" className="text-[11px] text-slate-600 hover:text-slate-400 font-headline uppercase tracking-widest transition-colors font-bold">
          Resend verification email
        </Link>
      </div>
    </div>
  );
};
