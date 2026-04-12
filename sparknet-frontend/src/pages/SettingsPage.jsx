import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [privacyMode, setPrivacyMode] = useState('public');
  const [dailyLimit, setDailyLimit] = useState(60);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete('/users/account');
      toast.success('Account deleted successfully');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/users/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparknet-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-enter py-8 px-4 sm:px-6">
      <div className="mb-8 border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">settings</span>
          Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your account and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Privacy Settings */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5">
          <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shield</span> 
            Privacy Controls
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-headline uppercase tracking-widest text-slate-500 mb-3 font-bold">Profile Visibility</label>
              <div className="space-y-3">
                {['public', 'linked_nodes', 'stealth'].map(mode => (
                  <label key={mode} className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border ${
                    privacyMode === mode 
                      ? 'bg-primary/5 border-primary/30 text-primary shadow-[0_0_15px_rgba(173,198,255,0.05)]' 
                      : 'bg-surface-container-highest border-outline-variant/10 text-slate-400 hover:border-outline-variant/30 hover:bg-surface-container-high'
                  }`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      value={mode} 
                      checked={privacyMode === mode}
                      onChange={(e) => setPrivacyMode(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex-1 capitalize font-headline font-bold text-sm tracking-wide">
                      {mode === 'stealth' ? 'Private' : mode === 'linked_nodes' ? 'Connections Only' : 'Public'}
                    </div>
                    {privacyMode === mode && <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>}
                    {privacyMode !== mode && <span className="material-symbols-outlined text-[18px] opacity-40">radio_button_unchecked</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Wellbeing */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5">
          <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed">self_improvement</span>
            Digital Wellbeing
          </h2>
          
          <div className="space-y-8">
            <div>
              <label className="block text-[11px] font-headline uppercase tracking-widest text-slate-500 mb-3 font-bold">
                Daily Time Limit (Minutes)
              </label>
              <input 
                type="range" 
                min="15" 
                max="240" 
                step="15"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] font-headline font-bold text-slate-500 dark mt-3">
                <span>15m</span>
                <span className="text-primary tracking-widest text-sm bg-primary/10 px-3 py-1 rounded-full">{dailyLimit}m</span>
                <span>4h</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-container-highest border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
              <div>
                <p className="font-headline font-bold text-sm text-slate-200">Take a Break</p>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">Remind me to take a break every 30 mins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-90 sm:scale-100">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-12 h-6 bg-surface-container-lowest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant/20"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-4 mt-8 border-t border-outline-variant/10">
        <button className="px-6 py-3 rounded-full text-sm font-headline font-bold text-slate-400 hover:text-slate-200 hover:bg-surface-container transition-colors">
          Discard Changes
        </button>
        <button onClick={handleSave} className="btn-primary rounded-full px-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </div>

      {/* Data & Privacy */}
      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5 mt-8">
        <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">download</span>
          Your Data
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Download a copy of all your SparkNet data including posts, connections, and profile info (GDPR).
        </p>
        <button
          onClick={handleExportData}
          className="px-6 py-3 rounded-full text-sm font-headline font-bold text-primary border border-primary/30 hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export My Data
        </button>
      </div>

      {/* Account Deletion */}
      <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/20 col-span-1 md:col-span-2 mt-8">
        <h2 className="font-headline font-bold text-xl text-red-400 tracking-tight mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">warning</span>
          Danger Zone
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Deleting your account is permanent. All your data, connections, and posts will be erased completely. This cannot be undone.
        </p>
        <button 
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="px-6 py-3 rounded-full text-sm font-headline font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">delete_forever</span>
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};
