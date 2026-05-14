import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, Loader2, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import RequestCard from "../components/RequestCard";

const TABS = ["All", "OPEN", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/requests/my");
        setRequests(res.data.requests);
      } catch {
        toast.error("Failed to load your requests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this request and get a full refund?")) return;
    setCancelling(id);
    try {
      await api.delete(`/requests/${id}`);
      toast.success("Request cancelled. Credits refunded.");
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "CANCELLED" } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = activeTab === "All" ? requests : requests.filter((r) => r.status === activeTab);
  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "All" ? requests.length : requests.filter((r) => r.status === t).length;
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">My Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track all your help requests and sessions
          </p>
        </div>
        <Link to="/requests/new" className="btn-teal text-sm px-4 py-2 flex items-center gap-2 self-start">
          <PlusCircle size={15} /> New Request
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map((tab) => (
          counts[tab] > 0 || tab === "All" ? (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tab.replace("_", " ")}
              {counts[tab] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ) : null
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((request) => (
            <div key={request.id} className="card p-5">
              <RequestCard request={request} />
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {request.session && (
                  <button
                    onClick={() => navigate(`/sessions/${request.session.id}`)}
                    className="flex items-center gap-1.5 text-xs font-medium text-teal-500 hover:underline"
                  >
                    <ExternalLink size={13} />
                    {request.session.status === "ACTIVE" ? "Join Session" : "View Session"}
                  </button>
                )}
                {["OPEN", "MATCHED"].includes(request.status) && (
                  <button
                    onClick={() => handleCancel(request.id)}
                    disabled={cancelling === request.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline ml-auto disabled:opacity-50"
                  >
                    {cancelling === request.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Cancel & Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium">
            {activeTab === "All" ? "No requests yet" : `No ${activeTab.toLowerCase().replace("_", " ")} requests`}
          </p>
          <p className="text-sm mt-1">
            {activeTab === "All" && "Post your first help request to get started."}
          </p>
          {activeTab === "All" && (
            <Link to="/requests/new" className="btn-teal mt-4 inline-block text-sm px-5 py-2">
              Post a Request
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
