import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/feed',          icon: 'rss_feed',           label: 'Feed' },
  { to: '/messages',      icon: 'chat_bubble',        label: 'Messages', hideForAdmin: true },
  { to: '/challenges',    icon: 'workspace_premium',  label: 'Challenges', hideForAdmin: true },
  { to: '/notifications', icon: 'notifications',      label: 'Notifications' },
];

const mgmtItems = [
  { to: '/guardian', icon: 'admin_panel_settings', label: 'Guardian', guardian: true },
  { to: '/admin',    icon: 'security',             label: 'Admin', admin: true },
];

export const Sidebar = () => {
  const { isGuardian, isAdmin } = useAuth();
  const { pathname } = useLocation();

  const SideLink = ({ to, icon, label }) => {
    const active = pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 ease-in-out group ${
          active ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-slate-500 hover:text-slate-200 hover:bg-surface-container/50'
        }`}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        <span className="font-headline uppercase tracking-[0.1em] text-[10px]">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col py-6 w-64 fixed left-0 top-16 bottom-0 bg-surface-container-lowest border-r border-outline-variant/10 z-10">
      
      {/* Group Header */}
      <div className="mb-6 px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-on-surface font-headline uppercase leading-tight">SparkNet</h2>
            <p className="font-headline uppercase tracking-[0.1em] text-[8px] text-primary">Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-[2px] overflow-y-auto custom-scrollbar">
        <div className="py-2 px-6 mt-2 mb-1">
          <span className="font-headline uppercase tracking-[0.1em] text-[10px] text-slate-500">Navigation</span>
        </div>
        
        {navItems.map(item => {
          if (item.hideForAdmin && isAdmin) return null;
          return <SideLink key={item.to} {...item} />;
        })}

        {(isGuardian || isAdmin) && (
          <>
            <div className="py-2 px-6 mt-6 mb-1 border-t border-outline-variant/10 pt-4">
              <span className="font-headline uppercase tracking-[0.1em] text-[10px] text-error">Management</span>
            </div>
            {mgmtItems.map(item => {
              if (item.guardian && !isGuardian) return null;
              if (item.admin && !isAdmin) return null;
              return <SideLink key={item.to} {...item} />;
            })}
          </>
        )}
      </nav>

      {/* Bottom Settings Link */}
      <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant/10">
        <Link 
          to="/profile" 
          className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container/50 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg">person</span>
          <span className="font-headline uppercase tracking-[0.1em] text-[10px]">My Profile</span>
        </Link>
        <Link 
          to="/settings" 
          className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container/50 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          <span className="font-headline uppercase tracking-[0.1em] text-[10px]">Settings</span>
        </Link>
      </div>

    </aside>
  );
};
