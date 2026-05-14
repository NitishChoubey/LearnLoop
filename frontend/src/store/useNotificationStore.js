import { create } from "zustand";
import api from "../lib/api";

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      set({ notifications: res.data.notifications, unreadCount: res.data.unreadCount });
    } catch {
      // silent fail
    }
  },

  markAllRead: async () => {
    try {
      await api.put("/notifications/read");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent fail
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
