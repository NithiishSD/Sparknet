import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const getIcon = (type) => {
  switch (type) {
    case 'like': return 'favorite';
    case 'comment': return 'forum';
    case 'follow': return 'person_add';
    case 'challenge': return 'workspace_premium';
    case 'system': return 'bolt';
    default: return 'notifications';
  }
};

const getColorClass = (type) => {
  switch (type) {
    case 'like': return 'text-error bg-error/10';
    case 'comment': return 'text-tertiary-fixed bg-tertiary-container/30';
    case 'follow': return 'text-primary bg-primary/10';
    case 'challenge': return 'text-tertiary bg-tertiary/10';
    case 'system': return 'text-primary bg-primary/10';
    default: return 'text-slate-400 bg-surface-container-highest';
  }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      if (data.success) setNotifications(data.notifications || data.data || []);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">notifications_active</span>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-slate-400 text-sm mt-1 font-medium">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-[11px] font-headline uppercase tracking-widest font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 bg-surface-container-highest px-4 py-2 rounded-full hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span> Mark all read
          </button>
          <button
            onClick={fetchNotifications}
            className="text-[11px] font-headline uppercase tracking-widest font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 bg-surface-container-highest px-4 py-2 rounded-full hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'unread', 'like', 'comment', 'follow', 'system'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-headline uppercase tracking-widest font-bold transition-all ${
              filter === f 
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(173,198,255,0.2)]' 
                : 'bg-surface-container-highest text-slate-400 hover:text-primary hover:bg-primary/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface-container rounded-3xl animate-pulse border border-outline-variant/5" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-surface-container rounded-3xl border border-outline-variant/5">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 opacity-50">notifications_paused</span>
            <p className="text-slate-400 font-medium font-headline tracking-wide">No notifications here</p>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`group p-5 rounded-2xl flex gap-4 transition-all border cursor-pointer ${
                !n.isRead
                  ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                  : 'bg-surface-container border-outline-variant/5 opacity-80 hover:opacity-100 hover:bg-surface-container-high'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                !n.isRead ? getColorClass(n.type) : 'bg-surface-container-highest text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {getIcon(n.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0 mt-0.5">
                <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                  {n.message || n.content}
                </p>
                <p className="text-[11px] font-headline uppercase tracking-widest font-bold text-slate-600 mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(173,198,255,0.8)] pulse-dot" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-error hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
