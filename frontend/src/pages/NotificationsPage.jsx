import { useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useNotificationStore from "../store/useNotificationStore";

const TYPE_CONFIG = {
  MATCH_FOUND: { icon: "🎯", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-800" },
  SESSION_STARTING: { icon: "🚀", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-100 dark:border-green-800" },
  CREDITS_EARNED: { icon: "🪙", bg: "bg-gold-50 dark:bg-gold-900/20", border: "border-gold-100 dark:border-gold-800" },
  BADGE_UNLOCKED: { icon: "🏅", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-100 dark:border-purple-800" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Bell size={24} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-gold-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-teal-500 hover:underline"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll be notified when someone accepts your request or you earn credits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.MATCH_FOUND;
            return (
              <div
                key={n.id}
                className={`card p-4 border flex items-start gap-4 transition-all ${cfg.bg} ${cfg.border}
                  ${!n.isRead ? "ring-1 ring-inset ring-teal-200 dark:ring-teal-800" : ""}`}
              >
                <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.isRead ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
