import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, BookOpen, Flame, PlusCircle, Search, ChevronRight, AlertCircle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import api from "../lib/api";
import CreditBadge from "../components/CreditBadge";
import BadgeDisplay from "../components/BadgeDisplay";
import RequestCard from "../components/RequestCard";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, sessRes] = await Promise.all([
          api.get("/requests?limit=3&status=OPEN"),
          api.get("/sessions/my"),
        ]);
        setRecentRequests(reqRes.data.requests);
        setMySessions(sessRes.data.sessions.slice(0, 3));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Knowledge Credits", value: user?.knowledgeCredits ?? 0, type: "credits", sub: "Available balance" },
    { label: "Sessions Taught", value: user?.totalSessionsTaught ?? 0, type: "number", color: "text-primary-500", sub: "As tutor" },
    { label: "Sessions Learned", value: user?.totalSessionsLearned ?? 0, type: "number", color: "text-teal-500", sub: "As learner" },
    { label: "Teaching Streak", value: user?.teachingStreak ?? 0, type: "streak", sub: "Consecutive days" },
  ];

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {user?.isVerified
              ? "Here's what's happening in your learning loop."
              : "Please verify your institution email to unlock all features."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/requests" className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
            <Search size={15} /> Find Help
          </Link>
          <Link to="/requests/new" className="btn-teal text-sm px-4 py-2 flex items-center gap-2">
            <PlusCircle size={15} /> Post Request
          </Link>
        </div>
      </div>

      {!user?.isVerified && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Verify your institution email</p>
            <p className="text-amber-600 dark:text-amber-500 text-xs mt-0.5">
              You need to verify your email before posting or accepting help requests.{" "}
              <Link to="/verify-otp" className="underline font-semibold">Verify now →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">{s.label}</p>
            {s.type === "credits" ? (
              <CreditBadge credits={s.value} size="lg" />
            ) : s.type === "streak" ? (
              <p className="text-3xl font-bold text-orange-500 flex items-center gap-1">
                <Flame size={26} /> {s.value}
              </p>
            ) : (
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Open Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Recent Help Requests</h2>
            <Link to="/requests" className="text-sm text-teal-500 hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((r) => (
                <RequestCard key={r.id} request={r} showAcceptButton onAccept={(id) => navigate(`/requests/${id}`)} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400 dark:text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p>No open requests right now.</p>
              <Link to="/requests/new" className="text-teal-500 text-sm mt-1 inline-block hover:underline">
                Be the first to post one →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reputation */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-400" /> Reputation
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
              <span className="font-bold text-primary-500 dark:text-primary-300 text-lg">
                {user?.reputationScore?.toFixed(1) || "0.0"} / 5.0
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-primary-500 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${((user?.reputationScore || 0) / 5) * 100}%` }}
              />
            </div>
            <Link to="/profile" className="text-xs text-teal-500 hover:underline">
              View full profile →
            </Link>
          </div>

          {/* Badges */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">🏅 My Badges</h3>
            <BadgeDisplay badges={user?.badges || []} max={6} size="sm" />
          </div>

          {/* Recent Sessions */}
          {mySessions.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-teal-400" /> My Sessions
              </h3>
              <div className="space-y-3">
                {mySessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s.status === "ACTIVE" ? "bg-green-500" :
                      s.status === "SCHEDULED" ? "bg-blue-500" : "bg-gray-300"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {s.helpRequest?.topic}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {s.tutorId === user?.id ? "You're tutoring" : "You're learning"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      s.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/my-requests" className="text-xs text-teal-500 hover:underline mt-3 block">
                View all →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
