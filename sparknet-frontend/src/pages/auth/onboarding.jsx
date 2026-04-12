import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import api from '../../api/axios';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { setUser, fetchMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    dateOfBirth: '',
    termsAccepted: false
  });

  // Verify the user is authenticated via cookie (set by OAuth redirect).
  // No ?token= in the URL anymore — cookie is sent automatically by the browser.
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      toast.error('You must accept the terms to continue');
      return;
    }
    setLoading(true);

    try {
      const { data } = await api.patch('/oauth/complete-onboarding', formData);

      if (data.success) {
        // Store refreshed token — role may have changed (e.g. to 'child' for minors)
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        setUser(data.user);
        toast.success('Profile completed');

        if (data.user.role === 'child' || data.user.status === 'pending_guardian_approval') {
          navigate('/guardian');
        } else {
          navigate('/feed');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-16 pb-12 animate-slide-up">
      <div className="bg-surface-container p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-tertiary-container/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/4"></div>

        <div className="mb-10 text-center relative z-10">
          <div className="w-16 h-16 mx-auto bg-surface-container-highest border border-outline-variant/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl rotate-3">
             <span className="material-symbols-outlined text-4xl text-primary font-light" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person_check</span>
          </div>
          <h2 className="font-headline font-black text-3xl text-on-surface tracking-tighter mb-2">Complete Your Profile</h2>
          <p className="text-slate-500 text-sm font-medium">Finish setting up your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input 
            label="Username" 
            type="text" 
            placeholder="e.g. john_doe"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            minLength={3} 
            maxLength={30}
          />

          <Input 
            label="Date of Birth" 
            type="date" 
            value={formData.dateOfBirth} 
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
            required 
            max={new Date().toISOString().split('T')[0]} 
          />

          {/* Terms and Conditions */}
          <label className="flex items-start gap-4 cursor-pointer group bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
            <input
              type="checkbox"
              required
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
              className="mt-0.5 accent-primary w-5 h-5 rounded border-outline-variant focus:ring-primary/20"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium leading-relaxed">
              I acknowledge the{' '}
              <span className="text-primary hover:text-primary-variant underline decoration-primary/30 transition-colors font-bold cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary hover:text-primary-variant underline decoration-primary/30 transition-colors font-bold cursor-pointer">Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner /> Saving...</> : <><span className="material-symbols-outlined text-[20px]">explore</span> Complete Setup</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
