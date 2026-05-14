import { Clock, Zap, User, Globe, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const URGENCY_CONFIG = {
  LOW: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Low" },
  MEDIUM: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Medium" },
  HIGH: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "High" },
  URGENT: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Urgent ⚡" },
};

const STATUS_CONFIG = {
  OPEN: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  MATCHED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function RequestCard({ request, onAccept, showAcceptButton = false }) {
  const navigate = useNavigate();
  const urgency = URGENCY_CONFIG[request.urgencyLevel] || URGENCY_CONFIG.LOW;
  const statusClass = STATUS_CONFIG[request.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-primary-500/10 text-primary-500 dark:text-primary-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {request.subject}
            </span>
            <span className={`badge ${urgency.color}`}>
              {urgency.label}
            </span>
            <span className={`badge ${statusClass}`}>
              {request.status.replace("_", " ")}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate">
            {request.topic}
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-gold-500/10 text-gold-600 dark:text-gold-400 px-2.5 py-1 rounded-full flex-shrink-0">
          <Coins size={14} />
          <span className="font-bold text-sm">{request.creditCost}</span>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
        {request.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {request.sessionDuration} min
        </span>
        <span className="flex items-center gap-1">
          <Globe size={12} />
          {request.preferredLanguage}
        </span>
        {request.postedBy && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {request.postedBy.name}
          </span>
        )}
        <span className="ml-auto">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/requests/${request.id}`)}
          className="flex-1 text-center text-sm font-medium text-primary-500 dark:text-primary-300 border border-primary-500/30 dark:border-primary-400/30 py-2 rounded-lg hover:bg-primary-500/5 transition-colors"
        >
          View Details
        </button>
        {showAcceptButton && request.status === "OPEN" && (
          <button
            onClick={() => onAccept?.(request.id)}
            className="flex-1 btn-teal text-sm py-2"
          >
            Accept & Tutor
          </button>
        )}
      </div>
    </div>
  );
}
