import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import RequestCard from "../components/RequestCard";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "Biology", "Economics", "History", "Literature", "Statistics", "Data Science", "Machine Learning", "Algorithms"];
const URGENCIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Mandarin"];

export default function RequestBoardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ subject: "", urgency: "", language: "" });
  const [search, setSearch] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, status: "OPEN" });
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.urgency) params.append("urgency", filters.urgency);
      if (filters.language) params.append("language", filters.language);
      if (search) params.append("subject", search);
      const res = await api.get(`/requests?${params}`);
      setRequests(res.data.requests);
      setTotalPages(res.data.pages);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [page, filters, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAccept = async (requestId) => {
    if (!user?.isVerified) {
      toast.error("Please verify your email first");
      return;
    }
    try {
      const res = await api.put(`/requests/${requestId}/assign`);
      toast.success("Request accepted! Open the teaching hub when you are ready.");
      const sessionId = res.data?.session?.id || res.data?.sessionId;
      if (sessionId) {
        navigate(`/tutor/sessions/${sessionId}/prep`);
        return;
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const clearFilters = () => {
    setFilters({ subject: "", urgency: "", language: "" });
    setSearch("");
    setPage(1);
  };
  const hasFilters = filters.subject || filters.urgency || filters.language || search;

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Teach</p>
          <h1 className="section-title">Request board</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-xl">
            Open requests from verified students. Filter by subject, urgency, or language.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            showFilters || hasFilters
              ? "border-teal-500 bg-teal-500 text-white shadow-soft shadow-teal-500/25"
              : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 hover:border-teal-400/50"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />}
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="input pl-11 shadow-sm"
          placeholder="Search by subject or topic…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-5 sm:p-6 mb-8 animate-slide-up rounded-3xl border-teal-500/10">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Subject</label>
              <select
                className="input"
                value={filters.subject}
                onChange={(e) => { setFilters({ ...filters, subject: e.target.value }); setPage(1); }}
              >
                <option value="">All Subjects</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Urgency</label>
              <select
                className="input"
                value={filters.urgency}
                onChange={(e) => { setFilters({ ...filters, urgency: e.target.value }); setPage(1); }}
              >
                <option value="">All Levels</option>
                {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select
                className="input"
                value={filters.language}
                onChange={(e) => { setFilters({ ...filters, language: e.target.value }); setPage(1); }}
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                showAcceptButton
                onAccept={handleAccept}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-sm font-semibold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-sm font-semibold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card rounded-3xl text-center py-20 px-6 border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
          <Search size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-200">No requests match</p>
          <p className="text-sm text-slate-500 mt-2">Try different filters or run <code className="text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">npm run db:seed</code> in the backend for demo data.</p>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
