import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge, StatusBadge } from '../common/Badge';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const NavLink = ({ to, label, strict = false }) => {
  const { pathname } = useLocation();
  const active = strict ? pathname === to : pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      className={`transition-colors active:scale-95 duration-200 py-2 px-3 rounded-lg text-sm font-medium ${
        active
          ? 'text-primary font-bold bg-surface-container-highest/50'
          : 'text-slate-400 hover:bg-surface-container/50'
      }`}
    >
      {label}
    </Link>
  );
};

export const Navbar = () => {
  const { user, logout, isAdmin, isGuardian } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { 
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); 
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread notification count every 30s
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        if (data.success) setUnreadCount(data.count ?? 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('See you next time ✌️');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="fixed top-0 w-full bg-slate-950/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-50 flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
      
      {/* Left: Logo & Central Nav (visible on md+) */}
      <div className="flex items-center gap-8">
        <Link to="/feed" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-black text-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(173,198,255,0.2)]">
            ⚡
          </div>
          <span className="text-xl font-bold tracking-tighter text-slate-100 font-headline hidden sm:block">
            Spark<span className="text-primary">Net</span>
          </span>
        </Link>
        
        {/* Horizontal Nav - only shown on md+ screens, though the main nav is in the sidebar on lg+ */}
        <nav className="hidden md:flex lg:hidden gap-2 items-center">
          <NavLink to="/feed" label="Feed" />
          {!isAdmin && <NavLink to="/challenges" label="Challenges" />}
          <NavLink to="/messages" label="Messages" />
        </nav>
      </div>

      {/* Right: Actions & Avatar */}
      <div className="flex items-center gap-4 relative" ref={dropRef}>
        
        {/* Search */}
        <Link to="/search" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 text-slate-300 hover:text-primary transition-colors hover:bg-primary/10">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </Link>

        {/* Notifications Bell */}
        <Link to="/notifications" className="relative flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 text-slate-300 hover:text-primary transition-colors hover:bg-primary/10">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(173,198,255,0.5)] pulse-dot">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        {/* Token/Points */}
        {user?.points !== undefined && (
          <div className="hidden sm:flex items-center gap-1 text-tertiary-fixed font-bold text-sm bg-surface-container py-1 px-3 rounded-full border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            {user.points.toLocaleString()}
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary/50 transition-colors focus:outline-none"
        >
          {user?.oauthAvatarUrl ? (
             <img src={user.oauthAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface font-headline font-bold">
              {avatarLetter}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-[120%] right-0 mt-2 w-64 bg-surface-container rounded-2xl border border-outline-variant/20 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up z-50">
            
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border border-outline-variant/30">
                  {user?.oauthAvatarUrl ? (
                     <img src={user.oauthAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface font-headline font-bold">
                      {avatarLetter}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate font-headline">{user?.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <RoleBadge role={user?.role} />
                <StatusBadge status={user?.status} />
              </div>
            </div>

            <div className="h-px bg-outline-variant/20 mx-3" />

            {/* Menu */}
            <div className="p-2">
              {[
                { to: '/profile', icon: 'person', label: 'My Profile' },
                { to: '/settings', icon: 'settings', label: 'Settings' },
                { to: '/change-password', icon: 'password', label: 'Security' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-surface-container-highest text-slate-300 hover:text-on-surface group"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="h-px bg-outline-variant/20 mx-3" />

            {/* Logout */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-error-container/20 text-error group"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>Logout</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </header>
  );
};

