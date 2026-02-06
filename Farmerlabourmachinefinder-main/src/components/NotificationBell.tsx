import { useEffect, useMemo, useState } from 'react';

export interface NotificationItem {
  id: string;
  userRole: 'Farmer' | 'Labour' | 'Machine Owner' | 'Admin';
  title: string;
  message: string;
  type: 'ActionRequired' | 'Info' | 'Warning' | 'Payment';
  read: boolean;
  timestamp: string;
}

interface NotificationBellProps {
  role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
}

const roleMap: Record<NotificationBellProps['role'], NotificationItem['userRole']> = {
  farmer: 'Farmer',
  labourer: 'Labour',
  machine_owner: 'Machine Owner',
  admin: 'Admin'
};

export function NotificationBell({ role }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
    const mute = localStorage.getItem('notificationsMuted');
    if (mute) {
      setMuted(mute === 'true');
    }
  }, []);

  const roleName = roleMap[role];
  const roleNotifications = useMemo(
    () => notifications.filter(n => n.userRole === roleName),
    [notifications, roleName]
  );
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  const updateNotifications = (next: NotificationItem[]) => {
    setNotifications(next);
    localStorage.setItem('notifications', JSON.stringify(next));
  };

  const markAllRead = () => {
    const next = notifications.map(n =>
      n.userRole === roleName ? { ...n, read: true } : n
    );
    updateNotifications(next);
  };

  const markRead = (id: string) => {
    const next = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    updateNotifications(next);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('notificationsMuted', String(next));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative px-3 py-2 border border-gray-200 rounded-lg text-sm"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex gap-2 text-xs">
              <button onClick={markAllRead} className="px-2 py-1 border border-gray-200 rounded-lg">
                Mark all read
              </button>
              <button onClick={toggleMute} className="px-2 py-1 border border-gray-200 rounded-lg">
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {roleNotifications.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500">No notifications</div>
            )}
            {roleNotifications.map(n => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 ${
                  n.read ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{n.type}</span>
                  <span>{n.timestamp}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{n.title}</div>
                <div className="text-xs text-gray-600">{n.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
