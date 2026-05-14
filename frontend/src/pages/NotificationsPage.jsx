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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Inbox</p>
          <h1 className="section-title flex flex-wrap items-center gap-3">
            <Bell size={26} className="text-teal-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-gradient-to-r from-gold-400 to-amber-500 text-primary-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
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
        <div className="text-center py-20 card rounded-3xl border-dashed border-2">
          <Bell size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-display font-semibold text-slate-800 dark:text-slate-200">You are all caught up</p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Accept a request or post one — we will notify you about matches, sessions, and credits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.MATCH_FOUND;
            return (
              <div
                key={n.id}
                className={`card p-5 rounded-2xl border flex items-start gap-4 transition-all ${cfg.bg} ${cfg.border}
                  ${!n.isRead ? "ring-2 ring-teal-500/25 shadow-soft" : ""}`}
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
