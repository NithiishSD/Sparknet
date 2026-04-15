import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeApi } from '../../api/challengeApi';
import toast from 'react-hot-toast';

export const CreateChallengePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 100,
    category: 'creative',
    durationDays: 7,
    visibility: 'global',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return toast.error('Title and description are required.');
    }
    setLoading(true);
    try {
      await challengeApi.createChallenge(formData);
      toast.success('Mission Deployed successfully!');
      navigate('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deploy mission');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 page-enter py-8 px-4 sm:px-6">
      <div className="border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">add_box</span>
          Deploy Mission
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Create a new objective for users or family members to conquer.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-outline-variant/10 space-y-6">
        
        <div>
          <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">
            Mission Designation (Title)
          </label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange}
            className="input-base w-full pb-3"
            placeholder="e.g. Daily Wellness Check, Advanced Code Challenge"
          />
        </div>

        <div>
          <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">
            Objective Parameters (Description)
          </label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            className="input-base w-full min-h-[120px] resize-none"
            placeholder="Describe what needs to be done..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">
              Reward (Credits)
            </label>
            <input 
              type="number" 
              name="points" 
              value={formData.points} 
              onChange={handleChange}
              min="10"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">
              Duration (Days)
            </label>
            <input 
              type="number" 
              name="durationDays" 
              value={formData.durationDays} 
              onChange={handleChange}
              min="1"
              max="365"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block">
              Category
            </label>
            <select name="category" value={formData.category} onChange={handleChange} className="input-base w-full pb-3 border-none ring-0">
              <option value="creative">Creative Arts</option>
              <option value="knowledge">Knowledge Base</option>
              <option value="coding">Software Engineering</option>
              <option value="wellness">Health & Wellness</option>
              <option value="community">Community Service</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-2 block text-primary">
              Availability Network (Visibility)
            </label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className="input-base w-full pb-3 bg-surface-container-highest border border-primary/20 text-on-surface">
              <option value="global">Global Platform (Available to All)</option>
              <option value="family">Private Network (Family & Linked Nodes Only)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button type="button" onClick={() => navigate('/challenges')} className="btn-secondary py-3 px-6 text-sm flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary py-3 px-6 text-sm flex-[2]">
            {loading ? 'Initializing...' : 'Deploy Mission Unit'}
          </button>
        </div>
      </form>
    </div>
  );
};
