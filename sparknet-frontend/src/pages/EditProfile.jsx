import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profileApi';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    interests: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileApi.getMyProfile();
        const { profile } = data.data;
        setFormData({
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          location: profile.location || '',
          interests: profile.interests?.join(', ') || '',
        });
        if (profile.avatar) {
          setPreview(`${import.meta.env.VITE_API_URL}${profile.avatar}`);
        }
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('displayName', formData.displayName);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    // Convert comma string to array
    const interestsArr = formData.interests.split(',').map(i => i.trim()).filter(i => i);
    interestsArr.forEach(int => data.append('interests', int));
    
    if (avatar) data.append('avatar', avatar);

    try {
      await profileApi.updateProfile(data);
      toast.success('Configuration updated');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 page-enter py-8 px-4 sm:px-6">
      <div className="flex items-center gap-6 mb-8 border-b border-outline-variant/10 pb-6">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-surface-container-highest hover:bg-surface-container-high transition-colors flex items-center justify-center text-slate-400 hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter">Modify Configuration</h1>
          <p className="text-slate-500 mt-2 font-medium">Update operator details for the network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Upload */}
        <div className="bg-surface-container rounded-3xl p-8 flex flex-col items-center border border-outline-variant/5">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
            <div className="w-40 h-40 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-[6px] border-surface-container transition-all group-hover:border-primary/50 shadow-2xl">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-slate-500">account_circle</span>
              )}
              <div className="absolute inset-0 bg-surface-container-highest/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm text-primary">
                <span className="material-symbols-outlined text-4xl">add_a_photo</span>
              </div>
            </div>
            <input 
              id="avatar-input" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-6 uppercase tracking-[0.2em] font-bold font-headline">Visual Identification</p>
        </div>

        {/* Basic Info */}
        <div className="bg-surface-container rounded-3xl p-8 space-y-6 border border-outline-variant/5">
          <div className="space-y-3">
            <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">badge</span> Operator Name
            </label>
            <input 
              type="text" 
              name="displayName" 
              value={formData.displayName} 
              onChange={handleChange} 
              placeholder="What should the network call you?"
              className="input-base w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">description</span> Bio Signature
            </label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="4"
              placeholder="Provide a brief summary for your node..."
              className="input-base w-full resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[16px]">location_on</span> Origin Sector
              </label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Where are you broadcasting from?"
                className="input-base w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[16px]">stars</span> Interests
              </label>
              <input 
                type="text" 
                name="interests" 
                value={formData.interests} 
                onChange={handleChange} 
                placeholder="Programming, Design, Science..."
                className="input-base w-full"
              />
              <p className="text-[10px] text-slate-500 font-headline uppercase tracking-wide mt-1 pl-2">Comma separated values</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className={`btn-primary w-full py-4 rounded-full text-base flex items-center justify-center gap-3 transition-all mt-4 ${saving ? 'opacity-50 cursor-wait' : ''}`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">save_as</span>
              Commit Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;