import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileApi } from '../../api/profileApi';

export const ConnectionsModal = ({ isOpen, onClose, targetId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && targetId) {
      fetchData();
    }
  }, [isOpen, targetId, type]);

  const fetchData = async () => {
    setLoading(true);
    setUsers([]);
    try {
      if (type === 'followers') {
        const { data } = await profileApi.getFollowers(targetId);
        if (data.success) setUsers(data.followers);
      } else {
        // Backend currently only supports MY following (`/api/users/following`)
        // If we want to view a target's following, the backend would need `/:targetId/following`. 
        // For now, if we don't have it, we show an empty array or restrict it.
        const { data } = await profileApi.getFollowing();
        if (data.success) setUsers(data.following);
      }
    } catch (e) {
      console.error('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low">
          <h2 className="font-headline font-bold text-xl text-on-surface capitalize">{type}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-slate-400 hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center p-8">
               <span className="material-symbols-outlined text-primary text-3xl animate-spin" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>progress_activity</span>
             </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map(u => (
                <div 
                  key={u._id}
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${u.username}`);
                  }}
                  className="flex items-center gap-3 p-3 bg-surface-container-highest/50 hover:bg-surface-container-high rounded-xl cursor-pointer transition-colors border border-transparent hover:border-outline-variant/10"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant/10 shrink-0">
                    {u.oauthAvatarUrl ? (
                      <img src={u.oauthAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-headline font-bold text-sm">
                        {u.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-slate-200 text-sm truncate">{u.username}</p>
                    {u.role && <p className="text-[10px] uppercase tracking-widest text-slate-500">{u.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">group_off</span>
              <p className="font-headline uppercase tracking-widest font-bold text-xs">No {type} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
