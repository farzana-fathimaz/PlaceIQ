import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  pagination:    null,

  setNotifications: (notifications, pagination) =>
    set({ notifications, pagination }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),

  clearUnread: () => set({ unreadCount: 0 }),

  markOneRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllReadLocally: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n._id !== id),
    })),
}))