import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Send, Square, Play, FileText, Users, Loader2,
  Star, X, MessageSquare, PenLine,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import { connectSocket, disconnectSocket } from "../lib/socket";
import SessionTimer from "../components/SessionTimer";

export default function SessionRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();
  const isTutorSessionRoom =
    /^\/tutor\/sessions\/[^/]+$/.test(location.pathname);
  const afterSessionPath = isTutorSessionRoom ? "/sessions?tab=teaching" : "/my-requests";
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [whiteboard, setWhiteboard] = useState("");
  const [remoteWhiteboard, setRemoteWhiteboard] = useState("");
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isTutor = session?.tutorId === user?.id;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        setSession(res.data.session);
        if (res.data.session.sessionNotes) {
          setWhiteboard(res.data.session.sessionNotes);
        }
      } catch {
        toast.error("Session not found");
        navigate(afterSessionPath);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, afterSessionPath]);

  useEffect(() => {
    if (!session || !user) return;
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join_session", { sessionId: id, userId: user.id, userName: user.name });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("whiteboard_update", ({ content }) => {
      setRemoteWhiteboard(content);
    });
    socket.on("room_participants", (parts) => {
      setParticipants(parts);
    });
    socket.on("user_joined", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `${userName} joined the session`, timestamp: new Date().toISOString() },
      ]);
    });
    socket.on("user_left", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `${userName} left the session`, timestamp: new Date().toISOString() },
      ]);
    });
    socket.on("session_started", () => {
      setSession((prev) => ({ ...prev, status: "ACTIVE", startTime: new Date().toISOString() }));
      toast.success("Session started!");
    });
    socket.on("session_ended", () => {
      setSession((prev) => ({ ...prev, status: "COMPLETED" }));
      setShowRatingModal(true);
    });
    socket.on("typing", ({ userName, userId }) => {
      if (userId !== user.id) setTypingUser(userName);
    });
    socket.on("stop_typing", () => setTypingUser(null));

    return () => {
      socket.off("chat_message");
      socket.off("whiteboard_update");
      socket.off("room_participants");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("session_started");
      socket.off("session_ended");
      socket.off("typing");
      socket.off("stop_typing");
      disconnectSocket();
    };
  }, [session, user, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = {
      sessionId: id,
      userId: user.id,
      userName: user.name,
      message: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    socketRef.current?.emit("chat_message", msg);
    setMessages((prev) => [...prev, msg]);
    setChatInput("");
    clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("stop_typing", { sessionId: id, userId: user.id });
  };

  const handleTyping = (val) => {
    setChatInput(val);
    socketRef.current?.emit("typing", { sessionId: id, userId: user.id, userName: user.name });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { sessionId: id, userId: user.id });
    }, 1500);
  };

  const handleWhiteboardChange = (val) => {
    setWhiteboard(val);
    socketRef.current?.emit("whiteboard_update", { sessionId: id, content: val });
  };

  const handleStartSession = async () => {
    try {
      await api.put(`/sessions/${id}/start`);
      socketRef.current?.emit("session_started", { sessionId: id });
      setSession((prev) => ({ ...prev, status: "ACTIVE", startTime: new Date().toISOString() }));
      toast.success("Session started!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start session");
    }
  };

  const handleEndSession = async () => {
    if (!confirm("End this session? Credits will be transferred to the tutor.")) return;
    try {
      const res = await api.put(`/sessions/${id}/end`, { sessionNotes: whiteboard });
      socketRef.current?.emit("session_ended", { sessionId: id });
      toast.success(`Session ended! ${res.data.creditsEarned} credits earned.`);
      if (isTutor) updateUser({ knowledgeCredits: (user?.knowledgeCredits || 0) + res.data.creditsEarned });
      setSession((prev) => ({ ...prev, status: "COMPLETED" }));
      setShowRatingModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end session");
    }
  };

  const handleSubmitRating = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setSubmittingRating(true);
    try {
      await api.post(`/sessions/${id}/rate`, { rating, comment: ratingComment });
      toast.success("Feedback submitted!");
      setShowRatingModal(false);
      navigate(afterSessionPath);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-mesh-light dark:bg-mesh-dark">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">
            {session?.helpRequest?.topic}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session?.helpRequest?.subject} · {isTutor ? `Teaching ${session?.learner?.name}` : `Learning from ${session?.tutor?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SessionTimer startTime={session?.startTime} isActive={session?.status === "ACTIVE"} />
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Users size={13} />
            {participants.length}
          </div>
          {session?.status === "SCHEDULED" && isTutor && (
            <button onClick={handleStartSession} className="btn-teal text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Play size={14} /> Start
            </button>
          )}
          {session?.status === "ACTIVE" && (
            <button onClick={handleEndSession} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-colors">
              <Square size={14} /> End Session
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {session?.status === "SCHEDULED" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 text-center">
          {isTutor ? "You can start the session when both parties are ready." : "Waiting for the tutor to start the session..."}
        </div>
      )}
      {session?.status === "COMPLETED" && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800 px-4 py-2 text-xs text-green-600 dark:text-green-400 text-center">
          Session completed. {!showRatingModal && (
            <button onClick={() => setShowRatingModal(true)} className="underline font-semibold">Leave feedback →</button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tab switcher on mobile */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sm:hidden">
            {[
              { id: "chat", icon: <MessageSquare size={15} />, label: "Chat" },
              { id: "whiteboard", icon: <PenLine size={15} />, label: "Whiteboard" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-400"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Chat Panel */}
            <div className={`flex flex-col border-r border-gray-200 dark:border-gray-700 ${activeTab === "chat" ? "flex" : "hidden"} sm:flex sm:w-80 lg:w-96`}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg, i) => (
                  msg.system ? (
                    <div key={i} className="text-center">
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  ) : (
                    <div key={i} className={`flex flex-col ${msg.userId === user?.id ? "items-end" : "items-start"}`}>
                      <span className="text-xs text-gray-400 mb-1">{msg.userName}</span>
                      <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                        msg.userId === user?.id
                          ? "bg-teal-500 text-white rounded-tr-sm"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm rounded-tl-sm"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  )
                ))}
                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    {typingUser} is typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  className="input text-sm py-2"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={session?.status === "COMPLETED"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || session?.status === "COMPLETED"}
                  className="btn-teal p-2 flex-shrink-0 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Whiteboard Panel */}
            <div className={`flex-1 flex flex-col ${activeTab === "whiteboard" ? "flex" : "hidden"} sm:flex`}>
              <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <PenLine size={15} className="text-teal-500" />
                  Shared Whiteboard
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await api.post(`/sessions/${id}/notes`, { sessionNotes: whiteboard });
                      toast.success("Notes saved!");
                    }}
                    className="text-xs text-teal-500 hover:underline flex items-center gap-1"
                  >
                    <FileText size={12} /> Save Notes
                  </button>
                </div>
              </div>
              <div className="flex-1 flex gap-0 overflow-hidden">
                <textarea
                  className="flex-1 resize-none p-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none border-r border-gray-200 dark:border-gray-700"
                  placeholder={`Start writing notes, code, or diagrams here...\n\nYour changes sync to the other participant in real-time.\n\nUse this space for:\n- Code snippets\n- Diagrams (ASCII art)\n- Step-by-step explanations\n- Key formulas\n- Practice problems`}
                  value={whiteboard}
                  onChange={(e) => handleWhiteboardChange(e.target.value)}
                  disabled={session?.status === "COMPLETED"}
                />
                {remoteWhiteboard !== whiteboard && remoteWhiteboard && (
                  <div className="w-1/2 p-5 bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-500 dark:text-gray-400 overflow-auto border-l border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-400 mb-2 font-sans">Remote view:</p>
                    <pre className="whitespace-pre-wrap">{remoteWhiteboard}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate Your Session</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  How was the session with {isTutor ? session?.learner?.name : session?.tutor?.name}?
                </p>
              </div>
              <button onClick={() => setShowRatingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-3 my-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={star <= rating ? "fill-gold-500 text-gold-500" : "text-gray-300 dark:text-gray-600"}
                  />
                </button>
              ))}
            </div>

            <textarea
              className="input resize-none mb-4"
              rows={3}
              placeholder="Leave a comment (optional)..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />

            <button
              onClick={handleSubmitRating}
              disabled={submittingRating || !rating}
              className="w-full btn-teal py-3 flex items-center justify-center gap-2"
            >
              {submittingRating ? <Loader2 size={18} className="animate-spin" /> : null}
              Submit Feedback
            </button>
            <button
              onClick={() => { setShowRatingModal(false); navigate(afterSessionPath); }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
