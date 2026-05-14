import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Loader2, Play, BookOpen, Coins, Clock, User, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";

const CHECKLIST = [
  "Confirm you have a quiet space and stable connection.",
  "Review the topic and any materials the student shared on the request.",
  "Start the session only when the learner has joined the room.",
  "Use chat and the shared whiteboard to explain step by step.",
  "End the session from the room when you are finished so credits can be released.",
];

export default function TutorSessionPrepPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        const s = res.data.session;
        if (s.tutorId !== user?.id) {
          toast.error("You are not the tutor for this session");
          navigate(`/sessions/${id}`);
          return;
        }
        setSession(s);
      } catch {
        toast.error("Session not found");
        navigate("/sessions?tab=teaching");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [id, user?.id, navigate]);

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const hr = session.helpRequest;
  const creditsPreview = hr?.creditCost != null ? Math.floor(hr.creditCost * 0.9) : "—";

  return (
    <div className="page-container max-w-2xl">
      <div className="flex justify-between items-start mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">Teaching hub</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white mb-5 shadow-glow ring-4 ring-teal-500/20">
          <BookOpen size={30} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">You accepted this session</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 max-w-md mx-auto leading-relaxed">
          Prep for a few seconds, then open the live room when you are ready to teach.
        </p>
      </div>

      <div className="card p-6 sm:p-7 mb-6 rounded-3xl">
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">{hr?.topic}</h2>
        <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold mb-5">{hr?.subject}</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <User size={16} className="text-teal-500 shrink-0" />
            <span>Teaching <strong className="text-slate-900 dark:text-white">{session.learner?.name}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock size={16} className="text-teal-500 shrink-0" />
            <span>Up to <strong className="text-slate-900 dark:text-white">{hr?.sessionDuration}</strong> min</span>
          </div>
          <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 sm:col-span-2">
            <Coins size={16} />
            <span>
              Estimated credits after completion: <strong>{creditsPreview}</strong> (90% of escrow)
            </span>
          </div>
        </div>
      </div>

      <div className="card p-6 sm:p-7 mb-8 rounded-3xl">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Quick checklist</h3>
        <ul className="space-y-3">
          {CHECKLIST.map((line) => (
            <li key={line} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate(`/tutor/sessions/${id}`)}
          className="flex-1 btn-teal py-3.5 flex items-center justify-center gap-2 text-base rounded-xl"
        >
          <Play size={20} />
          Enter session room
        </button>
        <Link to={`/requests/${hr?.id}`} className="flex-1 btn-outline py-3.5 text-center rounded-xl flex items-center justify-center">
          View request again
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-8">
        Status <span className="font-bold text-slate-700 dark:text-slate-300">{session.status}</span>
        {" · "}
        <Link to="/sessions?tab=teaching" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">My teaching sessions</Link>
      </p>
    </div>
  );
}
