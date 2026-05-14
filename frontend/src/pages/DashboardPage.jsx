import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, BookOpen, Flame, PlusCircle, Search, ChevronRight, AlertCircle,
  Sparkles, Radio,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import api from "../lib/api";
import CreditBadge from "../components/CreditBadge";
import BadgeDisplay from "../components/BadgeDisplay";
import RequestCard from "../components/RequestCard";

const COMMUNITY_PULSE = [
  { name: "Riley K.", subject: "Linear algebra — eigenvectors", credits: 6, ago: "4m" },
  { name: "Noah P.", subject: "React hooks & state lifting", credits: 5, ago: "11m" },
  { name: "Aisha T.", subject: "AP Physics — rotational motion", credits: 8, ago: "18m" },
  { name: "Marcus W.", subject: "SQL joins explained slowly", credits: 4, ago: "26m" },
  { name: "Sofia L.", subject: "Essay structure for lit class", credits: 3, ago: "33m" },
];

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
          api.get("/requests?limit=4&status=OPEN"),
          api.get("/sessions/my"),
        ]);
        setRecentRequests(reqRes.data.requests);
        setMySessions(sessRes.data.sessions.slice(0, 4));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Knowledge credits", value: user?.knowledgeCredits ?? 0, type: "credits", sub: "Spend or earn in sessions", icon: Sparkles },
    { label: "Sessions taught", value: user?.totalSessionsTaught ?? 0, type: "number", color: "text-primary-600 dark:text-teal-300", sub: "As tutor", icon: BookOpen },
    { label: "Sessions learned", value: user?.totalSessionsLearned ?? 0, type: "number", color: "text-teal-600 dark:text-teal-300", sub: "As learner", icon: BookOpen },
    { label: "Teaching streak", value: user?.teachingStreak ?? 0, type: "streak", sub: "Consecutive days", icon: Flame },
  ];

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Overview</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
            {user?.isVerified
              ? "Here is a snapshot of your loop — open requests, reputation, and recent sessions."
              : "Verify your institution email to post requests, accept sessions, and unlock the full experience."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/requests" className="btn-outline text-sm px-5 py-2.5 inline-flex items-center gap-2 rounded-xl">
            <Search size={16} /> Browse requests
          </Link>
          <Link to="/requests/new" className="btn-teal text-sm px-5 py-2.5 inline-flex items-center gap-2 rounded-xl shadow-soft">
            <PlusCircle size={16} /> Post request
          </Link>
        </div>
      </div>

      {!user?.isVerified && (
        <div className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/20 dark:border-amber-800/50 p-5 flex items-start gap-4 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-amber-900 dark:text-amber-200">Verify your institution email</p>
            <p className="text-amber-800/90 dark:text-amber-200/80 text-sm mt-1">
              Required before posting or accepting help requests.{" "}
              <Link to="/verify-otp" className="font-semibold underline decoration-2 underline-offset-2">Verify now</Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card group">
              <div className="relative flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{s.label}</p>
                  {s.type === "credits" ? (
                    <CreditBadge credits={s.value} size="lg" />
                  ) : s.type === "streak" ? (
                    <p className="text-3xl font-bold text-orange-500 flex items-center gap-1 font-display">
                      <Flame size={26} className="shrink-0" /> {s.value}
                    </p>
                  ) : (
                    <p className={`text-3xl font-bold font-display ${s.color}`}>{s.value}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{s.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-teal-500/15 group-hover:text-teal-600 transition-colors">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/80 to-teal-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-teal-950/20 dark:border-slate-700/60 p-5 sm:p-6 mb-10 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Radio size={16} className="text-teal-500 animate-pulse" />
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base">Community pulse</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-auto hidden sm:inline">Sample activity</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COMMUNITY_PULSE.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 px-4 py-3 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">{c.subject}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span className="font-semibold text-gold-600 dark:text-gold-400">{c.credits} cr</span>
                <span>{c.ago}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">Open help requests</h2>
            <Link to="/requests" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
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
            <div className="card p-10 text-center rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <BookOpen size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No open requests right now</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">Seed the database or post the first request on your campus.</p>
              <Link to="/requests/new" className="btn-teal text-sm px-6 py-2.5 inline-flex rounded-xl">
                Post a request
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6 rounded-3xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-500" /> Reputation
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Score</span>
              <span className="font-display font-bold text-primary-700 dark:text-teal-300 text-xl">
                {user?.reputationScore?.toFixed(1) || "0.0"} <span className="text-sm font-normal text-slate-400">/ 5</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 via-teal-500 to-gold-400 transition-all duration-500"
                style={{ width: `${Math.min(100, ((user?.reputationScore || 0) / 5) * 100)}%` }}
              />
            </div>
            <Link to="/profile" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Edit profile →
            </Link>
          </div>

          <div className="card p-6 rounded-3xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Badges</h3>
            <BadgeDisplay badges={user?.badges || []} max={6} size="sm" />
          </div>

          <div className="card p-6 rounded-3xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-teal-500" /> Recent sessions
            </h3>
            {mySessions.length > 0 ? (
              <>
                <div className="space-y-2">
                  {mySessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      className="w-full flex items-center gap-3 text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        s.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                        s.status === "SCHEDULED" ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
                      }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.helpRequest?.topic}</p>
                        <p className="text-xs text-slate-500">
                          {s.tutorId === user?.id ? "You are tutoring" : "You are learning"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.status}</span>
                    </button>
                  ))}
                </div>
                <Link to="/sessions" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-4 inline-block">
                  All sessions →
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No sessions yet. Accept a request or post one to start.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
