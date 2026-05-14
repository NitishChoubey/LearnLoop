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
      await api.put(`/requests/${requestId}/assign`);
      toast.success("Request accepted! Session created.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Help Request Board</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find a student who needs your expertise</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || hasFilters
              ? "bg-primary-500 text-white border-primary-500"
              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-teal-400 rounded-full" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by subject or topic..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 mb-6 animate-slide-up">
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
            <button onClick={clearFilters} className="mt-3 text-xs text-red-500 hover:underline flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No requests found</p>
          <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-teal-500 hover:underline text-sm">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
