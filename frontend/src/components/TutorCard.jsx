import { Star, BookOpen, Flame, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TutorCard({ tutor, matchScore, rank, isBestMatch }) {
  const navigate = useNavigate();

  return (
    <div
      className={`card p-5 cursor-pointer hover:shadow-md transition-all duration-200 relative
        ${isBestMatch ? "ring-2 ring-teal-500 dark:ring-teal-400" : ""}`}
      onClick={() => navigate(`/tutors/${tutor.id}`)}
    >
      {isBestMatch && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Award size={12} />
          Best Match
        </div>
      )}
      {rank && (
        <div className="absolute top-3 right-3 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          #{rank}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {tutor.profilePicture ? (
            <img src={tutor.profilePicture} alt={tutor.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            tutor.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{tutor.name}</h3>
          <div className="flex items-center gap-1">
            <Star size={13} className="text-gold-500 fill-gold-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {tutor.reputationScore?.toFixed(1) || "New"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tutor.subjectExpertise?.slice(0, 3).map((s) => (
          <span
            key={s.id}
            className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-300 px-2 py-0.5 rounded-full"
          >
            {s.subject}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          {tutor.totalSessionsTaught} sessions
        </span>
        {tutor.teachingStreak > 0 && (
          <span className="flex items-center gap-1 text-orange-500">
            <Flame size={12} />
            {tutor.teachingStreak} day streak
          </span>
        )}
        {matchScore !== undefined && (
          <span className="font-bold text-teal-600 dark:text-teal-400">
            {matchScore}% match
          </span>
        )}
      </div>

      {tutor.badges?.length > 0 && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {tutor.badges.slice(0, 3).map((ub) => (
            <span key={ub.id} title={ub.badge.description} className="text-lg cursor-help">
              {ub.badge.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
