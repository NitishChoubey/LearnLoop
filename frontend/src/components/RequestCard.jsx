import { Clock, Zap, User, Globe, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const URGENCY_CONFIG = {
  LOW: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", label: "Low" },
  MEDIUM: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", label: "Medium" },
  HIGH: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", label: "High" },
  URGENT: { color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", label: "Urgent" },
};

const STATUS_CONFIG = {
  OPEN: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  MATCHED: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  IN_PROGRESS: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function RequestCard({ request, onAccept, showAcceptButton = false }) {
  const navigate = useNavigate();
  const urgency = URGENCY_CONFIG[request.urgencyLevel] || URGENCY_CONFIG.LOW;
  const statusClass = STATUS_CONFIG[request.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="card-hover p-5 sm:p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-bold px-2.5 py-1">
              {request.subject}
            </span>
            <span className={`badge ${urgency.color}`}>{urgency.label}</span>
            <span className={`badge ${statusClass}`}>{request.status.replace("_", " ")}</span>
          </div>
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg leading-snug line-clamp-2">
            {request.topic}
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-gradient-to-br from-gold-100 to-amber-100 dark:from-gold-900/30 dark:to-amber-900/20 text-gold-700 dark:text-gold-400 px-3 py-1.5 font-bold text-sm shadow-inner border border-gold-200/50 dark:border-gold-700/30 shrink-0">
          <Coins size={15} />
          {request.creditCost}
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
        {request.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-500 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} className="text-teal-500" />
          {request.sessionDuration} min
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Globe size={13} className="text-teal-500" />
          {request.preferredLanguage}
        </span>
        {request.postedBy && (
          <span className="inline-flex items-center gap-1.5">
            <User size={13} className="text-teal-500" />
            {request.postedBy.name}
          </span>
        )}
        <span className="sm:ml-auto text-slate-400">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => navigate(`/requests/${request.id}`)}
          className="flex-1 text-center text-sm font-semibold text-primary-700 dark:text-teal-300 border-2 border-slate-200 dark:border-slate-600 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
        >
          View details
        </button>
        {showAcceptButton && request.status === "OPEN" && (
          <button
            type="button"
            onClick={() => onAccept?.(request.id)}
            className="flex-1 btn-teal text-sm py-2.5 rounded-xl"
          >
            Accept &amp; tutor
          </button>
        )}
      </div>
    </div>
  );
}
