import { Star, BookOpen, Flame, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RANK_STYLES = {
  1: "bg-gradient-to-br from-gold-400 to-amber-500 text-white shadow-lg shadow-gold-500/25",
  2: "bg-gradient-to-br from-slate-300 to-slate-400 text-white",
  3: "bg-gradient-to-br from-amber-600 to-orange-700 text-white",
};

export default function LeaderboardRow({ user, rank }) {
  const navigate = useNavigate();
  const rankStyle = RANK_STYLES[rank] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/80 dark:ring-slate-700";

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/tutors/${user.id}`)}
      className="card px-4 sm:px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-soft-lg hover:border-teal-500/20 dark:hover:border-teal-500/25 rounded-2xl"
      onClick={() => navigate(`/tutors/${user.id}`)}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${rankStyle}`}>
        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
      </div>

      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold shrink-0 shadow-soft ring-2 ring-white/20 dark:ring-slate-900/50">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="" className="w-full h-full rounded-xl object-cover" />
        ) : (
          user.name?.[0]?.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {user.subjectExpertise?.slice(0, 2).map((s) => (
            <span key={s.id} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {s.subject}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-5 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gold-600 dark:text-gold-400 font-bold font-display">
            <Star size={14} className="fill-gold-400 text-gold-500" />
            {user.reputationScore?.toFixed(1) || "—"}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary-600 dark:text-teal-300 font-bold font-display">
            <BookOpen size={14} />
            {user.totalSessionsTaught}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Taught</p>
        </div>
        {user.teachingStreak > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 font-bold font-display">
              <Flame size={14} />
              {user.teachingStreak}
            </div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Streak</p>
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gold-600 dark:text-gold-400 font-bold font-display">
            <Coins size={14} />
            {user.knowledgeCredits}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Credits</p>
        </div>
      </div>
    </div>
  );
}
