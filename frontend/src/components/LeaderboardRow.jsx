import { Star, BookOpen, Flame, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RANK_STYLES = {
  1: "bg-gold-500 text-white",
  2: "bg-gray-400 text-white",
  3: "bg-amber-600 text-white",
};

export default function LeaderboardRow({ user, rank }) {
  const navigate = useNavigate();
  const rankStyle = RANK_STYLES[rank] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  return (
    <div
      className="card px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/tutors/${user.id}`)}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${rankStyle}`}>
        {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : `#${rank}`}
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          user.name?.[0]?.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {user.subjectExpertise?.slice(0, 2).map((s) => (
            <span key={s.id} className="text-xs text-gray-400 dark:text-gray-500">{s.subject}</span>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-5 text-sm">
        <div className="text-center">
          <div className="flex items-center gap-1 text-gold-500 font-bold">
            <Star size={14} className="fill-gold-500" />
            {user.reputationScore?.toFixed(1) || "—"}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 text-primary-500 dark:text-primary-300 font-bold">
            <BookOpen size={14} />
            {user.totalSessionsTaught}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Sessions</p>
        </div>
        {user.teachingStreak > 0 && (
          <div className="text-center">
            <div className="flex items-center gap-1 text-orange-500 font-bold">
              <Flame size={14} />
              {user.teachingStreak}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Streak</p>
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center gap-1 text-gold-600 dark:text-gold-400 font-bold">
            <Coins size={14} />
            {user.knowledgeCredits}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Credits</p>
        </div>
      </div>
    </div>
  );
}
