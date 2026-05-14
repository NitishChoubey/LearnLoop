import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Loader2, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "Biology", "Economics", "History", "Literature", "Statistics", "Data Science", "Machine Learning", "Algorithms", "Other"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Mandarin", "Other"];
const URGENCY_MULTIPLIERS = { LOW: 1, MEDIUM: 1.5, HIGH: 2, URGENT: 3 };
const URGENCY_LABELS = {
  LOW: { label: "Low", desc: "Can wait a day or two", color: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20" },
  MEDIUM: { label: "Medium", desc: "Need help within 24 hours", color: "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20" },
  HIGH: { label: "High", desc: "Need help today", color: "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20" },
  URGENT: { label: "Urgent ⚡", desc: "Exam or deadline soon!", color: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" },
};

const calcCost = (duration, urgency) => {
  const mult = URGENCY_MULTIPLIERS[urgency] || 1;
  return Math.ceil((parseInt(duration) / 30) * mult);
};

export default function PostRequestPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    description: "",
    preferredLanguage: "English",
    urgencyLevel: "LOW",
    sessionDuration: "60",
  });

  const estimatedCost = form.sessionDuration && form.urgencyLevel
    ? calcCost(form.sessionDuration, form.urgencyLevel)
    : 0;

  const hasEnough = (user?.knowledgeCredits || 0) >= estimatedCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.isVerified) {
      toast.error("Please verify your institution email first");
      navigate("/verify-otp");
      return;
    }
    if (!hasEnough) {
      toast.error(`Not enough credits. You need ${estimatedCost} but have ${user?.knowledgeCredits}.`);
      return;
    }
    setLoading(true);
    try {
      await api.post("/requests", form);
      updateUser({ knowledgeCredits: (user?.knowledgeCredits || 0) - estimatedCost });
      toast.success("Help request posted! Tutors will be notified.");
      navigate("/my-requests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-8">
        <h1 className="section-title">Post a Help Request</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Describe what you need help with. Credits are held in escrow until your session completes.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Subject *</label>
                <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                  <option value="">Select subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred Language *</label>
                <select className="input" value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Topic / Question *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Binary Search Tree insertion and deletion"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required
                maxLength={120}
              />
              <p className="text-xs text-gray-400 mt-1">{form.topic.length}/120</p>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Describe your problem in detail. What have you tried? What are you confused about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={20}
              />
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Session Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, sessionDuration: String(d) })}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.sessionDuration === String(d)
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Urgency Level</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(URGENCY_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, urgencyLevel: key })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.urgencyLevel === key
                        ? val.color + " border-opacity-100"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{val.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !hasEnough}
            className="w-full btn-teal py-3.5 text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                Post Request · {estimatedCost} <Coins size={16} /> credits
              </>
            )}
          </button>
        </form>

        {/* Cost Preview */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Cost Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{form.sessionDuration} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Urgency × {URGENCY_MULTIPLIERS[form.urgencyLevel]}x</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{URGENCY_LABELS[form.urgencyLevel]?.label}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total Cost</span>
                <span className="font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1">
                  <Coins size={15} /> {estimatedCost} credits
                </span>
              </div>
            </div>
            <div className={`mt-4 p-3 rounded-lg text-xs ${hasEnough ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
              {hasEnough
                ? `✓ You have ${user?.knowledgeCredits} credits — sufficient`
                : `✗ You need ${estimatedCost} but only have ${user?.knowledgeCredits}`}
            </div>
          </div>

          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <div className="flex gap-2">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold">How escrow works</p>
                <p>Credits are deducted now and held safely. When your session completes successfully, the tutor receives 90% and you get the value of a great learning experience!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
