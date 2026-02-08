import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markNotificationRead } from '../services/notifications.service';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'ActionRequired' | 'Info' | 'Warning' | 'Payment';
  read: boolean;
  timestamp?: string;
  createdAtFormatted?: string;
  link?: { type: 'job' | 'payment' | 'machine' | 'dashboard'; id?: string };
}

interface NotificationBellProps {
  role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications()
      .then(({ notifications: items }) => setNotifications(items))
      .catch(() => setNotifications([]));
  }, []);

  const roleNotifications = useMemo(() => notifications, [notifications]);
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  const updateNotifications = (next: NotificationItem[]) => {
    setNotifications(next);
  };

  const markAllRead = () => {
    const next = notifications.map(n => ({ ...n, read: true }));
    updateNotifications(next);
  };

  const markRead = (id: string) => {
    const next = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    updateNotifications(next);
    markNotificationRead(id).catch(() => {});
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
  };

  useEffect(() => {
    if (!open) return;
    getUnreadCount().catch(() => {});
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dropdownWidth = 320;
      const right = Math.max(12, window.innerWidth - rect.right);
      const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 12);
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: right < 12 ? left : undefined,
        right: right >= 12 ? right : undefined,
        width: dropdownWidth,
        zIndex: 1000
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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
      {open && createPortal(
        <div style={dropdownStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg">
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
                onClick={() => {
                  markRead(n.id);
                  if (n.link?.type === 'job' && n.link.id) navigate('/jobs');
                  if (n.link?.type === 'payment' && n.link.id) navigate('/payments');
                  if (n.link?.type === 'machine' && n.link.id) navigate('/machines');
                  if (n.link?.type === 'dashboard') navigate('/');
                }}
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
        </div>,
        document.body
      )}
    </div>
  );
}
