import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BookOpen, Loader2, ChevronRight, GraduationCap, School } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";

const TABS = [
  { id: "teaching", label: "Teaching", icon: GraduationCap },
  { id: "learning", label: "Learning", icon: School },
];

const statusStyle = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  COMPLETED: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
};

export default function MySessionsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(tabParam === "teaching" || tabParam === "learning" ? tabParam : "teaching");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabParam === "teaching" || tabParam === "learning") setTab(tabParam);
  }, [tabParam]);

  const setTabAndUrl = (id) => {
    setTab(id);
    setSearchParams(id === "teaching" ? { tab: "teaching" } : { tab: "learning" });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/sessions/my");
        setSessions(res.data.sessions || []);
      } catch {
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!user?.id) return [];
    return sessions.filter((s) => (tab === "teaching" ? s.tutorId === user.id : s.learnerId === user.id));
  }, [sessions, tab, user?.id]);

  const openSession = (s) => {
    if (s.tutorId === user?.id) navigate(`/tutor/sessions/${s.id}`);
    else navigate(`/sessions/${s.id}`);
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Live</p>
        <h1 className="section-title">My sessions</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg">
          Teaching and learning rooms you are part of — open one to continue chat and whiteboard.
        </p>
      </div>

      <div className="flex gap-2 mb-8 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl w-fit ring-1 ring-slate-200/80 dark:ring-slate-700/80">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTabAndUrl(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
          <BookOpen size={44} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-display font-semibold text-slate-800 dark:text-slate-200">
            {tab === "teaching" ? "No teaching sessions yet" : "No learning sessions yet"}
          </p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            {tab === "teaching"
              ? "Browse open requests and accept one that fits your expertise."
              : "Post a help request when you need peer support on a topic."}
          </p>
          <Link
            to={tab === "teaching" ? "/requests" : "/requests/new"}
            className="inline-flex items-center gap-1 mt-6 text-teal-500 font-medium hover:underline"
          >
            {tab === "teaching" ? "Find requests" : "Post a request"}
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => {
            const other = tab === "teaching" ? s.learner : s.tutor;
            const roleLabel = tab === "teaching" ? "Learner" : "Tutor";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => openSession(s)}
                  className="card p-5 w-full text-left hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[s.status] || statusStyle.SCHEDULED}`}>
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{s.helpRequest?.topic}</p>
                    <p className="text-sm text-primary-500 dark:text-primary-300">{s.helpRequest?.subject}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {roleLabel}: <span className="font-medium text-gray-700 dark:text-gray-200">{other?.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-teal-500 text-sm font-medium flex-shrink-0">
                    Open
                    <ChevronRight size={18} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
