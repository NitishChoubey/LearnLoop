import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Loader2, Clock, Globe, Zap, User, Coins,
  Sparkles, GraduationCap, MessageCircle, ExternalLink, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";

const URGENCY_LABEL = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data.request);
    } catch {
      toast.error("Request not found");
      navigate("/requests");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!request || request.postedById !== user?.id || request.status !== "OPEN") return;
    api
      .get(`/requests/${id}/matches`)
      .then((r) => setMatches(r.data.tutors || []))
      .catch(() => {});
  }, [request, user?.id, id]);

  const handleAccept = async () => {
    if (!user?.isVerified) {
      toast.error("Please verify your institution email first");
      navigate("/verify-otp");
      return;
    }
    setAccepting(true);
    try {
      const res = await api.put(`/requests/${id}/assign`);
      toast.success("Request accepted! Review the session, then enter the room when ready.");
      const sessionId = res.data?.session?.id || res.data?.sessionId;
      if (sessionId) navigate(`/tutor/sessions/${sessionId}/prep`);
      else load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || !request) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const isOwner = user?.id === request.postedById;
  const isAssignedTutor =
    user?.id === request.assignedTutorId || request.session?.tutorId === user?.id;
  const session = request.session;
  const canTutorThisRequest = request.status === "OPEN" && !isOwner;
  const showAcceptButton = canTutorThisRequest && user?.isVerified;

  return (
    <div className="page-container max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Request</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Review details before you teach or join the live room.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 shrink-0"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="card p-6 sm:p-8 mb-6 rounded-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-primary-500/10 text-primary-500 dark:text-primary-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {request.subject}
          </span>
          <span className="badge bg-gold-500/10 text-gold-600 dark:text-gold-400">
            {URGENCY_LABEL[request.urgencyLevel] || request.urgencyLevel}
          </span>
          <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {request.status.replace("_", " ")}
          </span>
          <span className="ml-auto flex items-center gap-1 text-gold-600 dark:text-gold-400 font-bold text-sm">
            <Coins size={16} /> {request.creditCost} credits
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{request.topic}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 whitespace-pre-wrap leading-relaxed">
          {request.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-5">
          <span className="flex items-center gap-1.5">
            <Clock size={15} className="text-teal-500" />
            {request.sessionDuration} minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={15} className="text-teal-500" />
            {request.preferredLanguage}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={15} className="text-teal-500" />
            Posted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Learner card */}
      {request.postedBy && (
        <div className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {request.postedBy.profilePicture ? (
              <img src={request.postedBy.profilePicture} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              request.postedBy.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Student asking for help</p>
            <p className="font-semibold text-gray-900 dark:text-white">{request.postedBy.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reputation {request.postedBy.reputationScore?.toFixed(1) ?? "—"} / 5
            </p>
          </div>
          {!isOwner && (
            <Link
              to={`/tutors/${request.postedBy.id}`}
              className="text-sm font-medium text-teal-500 hover:underline flex items-center gap-1 self-start sm:self-center"
            >
              <User size={14} /> View profile
            </Link>
          )}
        </div>
      )}

      {/* Owner: smart matches while open */}
      {isOwner && request.status === "OPEN" && matches.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-teal-500" />
            Suggested peer tutors
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Verified students who match your subject and language. The first tutor to accept your request will be paired with you.
          </p>
          <ul className="space-y-3">
            {matches.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {t.profilePicture ? (
                      <img src={t.profilePicture} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      t.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      Match score {t.matchScore}% · {t.totalSessionsTaught ?? 0} sessions taught
                    </p>
                  </div>
                </div>
                <Link to={`/tutors/${t.id}`} className="text-xs text-teal-500 hover:underline flex-shrink-0">
                  Profile
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learner: matched tutor */}
      {isOwner && session?.tutor && ["MATCHED", "IN_PROGRESS"].includes(request.status) && (
        <div className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-teal-500">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {session.tutor.profilePicture ? (
              <img src={session.tutor.profilePicture} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              session.tutor.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Your tutor</p>
            <p className="font-semibold text-gray-900 dark:text-white">{session.tutor.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reputation {session.tutor.reputationScore?.toFixed(1) ?? "—"} / 5
            </p>
          </div>
          <Link
            to={`/tutors/${session.tutor.id}`}
            className="text-sm font-medium text-teal-500 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <User size={14} /> View profile
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="card p-6 space-y-4 rounded-3xl">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap size={20} className="text-primary-500" />
          Next steps
        </h2>

        {!user?.isVerified && (canTutorThisRequest || isOwner) && (
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>
              Verify your institution email to post and accept requests.{" "}
              <Link to="/verify-otp" className="font-semibold underline">Verify now</Link>
            </span>
          </div>
        )}

        {isOwner && session && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(`/sessions/${session.id}`)}
              className="btn-teal flex items-center justify-center gap-2 py-3"
            >
              <MessageCircle size={18} />
              {session.status === "ACTIVE" ? "Join live session" : "Open session room"}
              <ExternalLink size={16} />
            </button>
            <Link to="/my-requests" className="btn-outline text-center py-3">
              Manage my requests
            </Link>
          </div>
        )}

        {isOwner && !session && request.status === "OPEN" && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When a tutor accepts, you will get a notification. You can also check <Link to="/my-requests" className="text-teal-500 hover:underline">My Requests</Link> anytime.
          </p>
        )}

        {showAcceptButton && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              By accepting, you commit to a short live session (chat and shared whiteboard). You will earn knowledge credits after the learner confirms the session is complete.
            </p>
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="w-full btn-teal py-3 flex items-center justify-center gap-2"
            >
              {accepting ? <Loader2 size={20} className="animate-spin" /> : null}
              Accept &amp; Tutor
            </button>
            <Link to="/requests" className="block text-center text-sm text-gray-500 hover:text-teal-500">
              Back to request board
            </Link>
          </div>
        )}

        {isAssignedTutor && session && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(`/tutor/sessions/${session.id}/prep`)}
              className="btn-teal flex items-center justify-center gap-2 py-3"
            >
              Teaching hub
              <ExternalLink size={16} />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tutor/sessions/${session.id}`)}
              className="btn-outline py-3"
            >
              Enter session room
            </button>
          </div>
        )}

        {!isOwner && !isAssignedTutor && request.status === "OPEN" && user?.isVerified && (
          <p className="text-sm text-gray-500">Another tutor may accept this request first. Refresh the board for the latest open requests.</p>
        )}

        {!isOwner && !isAssignedTutor && request.status === "OPEN" && !user?.isVerified && (
          <p className="text-sm text-gray-500">Verify your account to accept and tutor on LearnLoop.</p>
        )}

        {request.status !== "OPEN" && !isOwner && !isAssignedTutor && (
          <p className="text-sm text-gray-500">This request is no longer open.</p>
        )}
      </div>
    </div>
  );
}
