import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, BookOpen, Flame, Globe, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../lib/api";
import BadgeDisplay from "../components/BadgeDisplay";

export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((r) => setTutor(r.data.user))
      .catch(() => navigate("/requests"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-teal-500" />
      </div>
    );
  }
  if (!tutor) return null;

  const completedSessions = tutor.sessionsAsTutor || [];
  const avgRating = completedSessions.length > 0
    ? (completedSessions.reduce((s, sess) => s + (sess.feedbackFromLearner?.rating || 0), 0) / completedSessions.filter((s) => s.feedbackFromLearner).length) || 0
    : 0;

  return (
    <div className="page-container max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {tutor.profilePicture ? (
              <img src={tutor.profilePicture} alt={tutor.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              tutor.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tutor.name}</h1>
            {tutor.bio && (
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm leading-relaxed">{tutor.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400">
                <Star size={16} className="fill-gold-500 text-gold-500" />
                <span className="font-bold">{tutor.reputationScore?.toFixed(1) || "New"}</span>
                <span className="text-gray-400 font-normal">reputation</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary-500 dark:text-primary-300">
                <BookOpen size={16} />
                <span className="font-bold">{tutor.totalSessionsTaught}</span>
                <span className="text-gray-400 font-normal">sessions taught</span>
              </div>
              {tutor.teachingStreak > 0 && (
                <div className="flex items-center gap-1.5 text-orange-500">
                  <Flame size={16} />
                  <span className="font-bold">{tutor.teachingStreak}-day</span>
                  <span className="text-gray-400 font-normal">streak</span>
                </div>
              )}
              {tutor.languagesSpoken?.length > 0 && (
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Globe size={16} />
                  {tutor.languagesSpoken.join(", ")}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                <Calendar size={16} />
                Joined {formatDistanceToNow(new Date(tutor.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Expertise */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Subject Expertise</h3>
            {tutor.subjectExpertise?.length > 0 ? (
              <div className="space-y-2">
                {tutor.subjectExpertise.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.subject}</span>
                    <span className={`badge text-xs ${
                      s.level === "Expert" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      s.level === "Advanced" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      {s.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No expertise listed</p>
            )}
          </div>

          {/* Badges */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">🏅 Badges</h3>
            <BadgeDisplay badges={tutor.badges || []} size="md" />
          </div>
        </div>

        {/* Recent Sessions / Reviews */}
        <div className="md:col-span-2">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Recent Sessions
              {avgRating > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  · avg {avgRating.toFixed(1)} ★
                </span>
              )}
            </h3>
            {completedSessions.length > 0 ? (
              <div className="space-y-4">
                {completedSessions.map((s) => (
                  <div key={s.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {s.helpRequest?.topic}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.helpRequest?.subject} · {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {s.feedbackFromLearner && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={star <= s.feedbackFromLearner.rating ? "fill-gold-500 text-gold-500" : "text-gray-200 dark:text-gray-700"}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {s.feedbackFromLearner?.comment && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                        "{s.feedbackFromLearner.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No completed sessions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
