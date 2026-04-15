import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileApi } from '../api/profileApi';
import toast from 'react-hot-toast';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchUsers = async (searchTerm) => {
    setLoading(true);
    try {
      const { data } = await profileApi.searchUsers(searchTerm);
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto page-enter py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* Search Header */}
      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-tertiary-container/5 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-4xl">search</span>
            Explorer
          </h1>
          <p className="text-slate-400">Discover other accounts in the network to engage with.</p>
          
          <div className="relative mt-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input 
              type="text" 
              className="input-base w-full pl-12 py-4 rounded-2xl text-lg font-medium"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse font-headline uppercase tracking-widest font-bold text-sm">
            Scanning Network...
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((user) => (
              <Link key={user._id} to={`/profile/${user.username}`} className="bg-surface-container-highest rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/5 hover:border-primary/30 hover:bg-surface-container-high transition-all group">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-outline-variant/20 bg-surface-container flex items-center justify-center text-slate-400 font-headline font-bold text-lg group-hover:text-primary transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : user.oauthAvatarUrl ? (
                    <img src={user.oauthAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.username[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-slate-200 truncate group-hover:text-primary transition-colors">{user.displayName || user.username}</h3>
                    {user.role === 'child' && (
                      <span className="text-[9px] bg-tertiary-container/20 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded-sm font-headline font-black uppercase tracking-widest leading-none">Youth</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                </div>
                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
              </Link>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-12 bg-surface-container rounded-3xl border border-outline-variant/5">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">person_off</span>
            <p className="text-slate-400 font-medium">No active connections found matching '{query}'.</p>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">travel_explore</span>
            <p className="font-headline uppercase tracking-widest font-bold text-sm">Awaiting Input Query</p>
          </div>
        )}
      </div>
    </div>
  );
};
