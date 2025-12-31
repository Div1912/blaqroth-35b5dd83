import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'order';
  is_read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        const notifications = data as Notification[];
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        set({ notifications, unreadCount });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string, userId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('customer_id', userId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('customer_id', userId)
        .eq('is_read', false);

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  openNotifications: () => set({ isOpen: true }),
  closeNotifications: () => set({ isOpen: false }),
  toggleNotifications: () => set((state) => ({ isOpen: !state.isOpen })),
}));
