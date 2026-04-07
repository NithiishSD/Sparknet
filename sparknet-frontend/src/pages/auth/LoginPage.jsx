import { useState,useEffect } from 'react';
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
  const { login, fetchMe,user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

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
    const backendUrl =  'https://sparknet-backend.onrender.com';
    window.location.href = `${backendUrl}/api/oauth/google`;
  };
  
  
  // when the backend redirects the user back to React.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (token) {
      localStorage.setItem('accessToken', token);
      // Optional: clean the URL so the token isn't visible in the bar
      window.history.replaceState({}, document.title, "/login");
      
      // Your existing logic to load user data
      fetchMe().then(() => {
       
          toast.success(`Welcome back, ${user}!`);
          navigate('/dashboard', { replace: true });
        
        
      });
    }
  }, [navigate]);

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="spark-card p-8 shadow-2xl shadow-black/40">
        <div className="mb-8">
          <h1 className="font-sans font-extrabold text-2xl text-white mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm">Welcome back to SparkNet</p>
        </div>
        <div className="glow-line mb-8" />

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
          >
            {googleLoading ? <Spinner /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => toast('Facebook login coming soon!')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-sm transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={() => toast('Apple login coming soon!')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black hover:bg-gray-900 text-white font-semibold text-sm transition-all duration-200 border border-gray-700"
          >
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>

          <button
            onClick={() => toast('Twitter login coming soon!')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black hover:bg-gray-900 text-white font-semibold text-sm transition-all duration-200 border border-gray-700"
          >
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with Twitter / X
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="glow-line flex-1" />
          <span className="text-gray-600 text-xs font-mono">or sign in with email</span>
          <div className="glow-line flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoFocus
          />
          <div className="space-y-1">
            <label className="spark-label">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="spark-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors"
              >
                {showPw ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-spark-400 hover:text-spark-300 font-mono transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="spark-btn-primary w-full">
            {loading ? <><Spinner /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-spark-400 hover:text-spark-300 font-sans font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link to="/resend-verification" className="text-xs text-gray-600 hover:text-gray-400 transition-colors font-mono">
          Resend verification email
        </Link>
      </div>
    </div>
  );
};
