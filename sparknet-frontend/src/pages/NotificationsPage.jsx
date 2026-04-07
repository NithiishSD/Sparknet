import { useState } from 'react';

const dummyNotifications = [
  {
    id: 1,
    type: 'like',
    content: 'Sarah Chen liked your post about React Native.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isRead: false
  },
  {
    id: 2,
    type: 'comment',
    content: 'Alex Mercer commented on your post: "Great work!"',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  },
  {
    id: 3,
    type: 'system',
    content: 'Welcome to SparkNet! Check out the challenges section to earn your first badge.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true
  }
];

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'system': return '⚡';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-800 text-3xl text-white">Notifications</h1>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-display font-600 text-spark-400 hover:text-spark-300 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(notification => (
           <div 
            key={notification._id || notification.id} 
            className={`spark-card p-4 flex gap-4 transition-all ${!notification.isRead ? 'border-spark-500/50 bg-spark-500/5' : 'opacity-70'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${!notification.isRead ? 'bg-spark-500/20 text-spark-400' : 'bg-dark-600 text-gray-400'}`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!notification.isRead ? 'text-gray-200' : 'text-gray-400'}`}>{notification.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            {!notification.isRead && (
               <div className="w-2 h-2 rounded-full bg-spark-500 self-center"></div>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12">
             <div className="text-4xl mb-4">📭</div>
             <p className="text-gray-400">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};
