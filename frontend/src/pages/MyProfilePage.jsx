import { useState } from "react";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import BadgeDisplay from "../components/BadgeDisplay";
import CreditBadge from "../components/CreditBadge";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const ALL_LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Mandarin", "Arabic", "Other"];

export default function MyProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    languagesSpoken: user?.languagesSpoken || [],
    subjectExpertise: user?.subjectExpertise || [],
  });
  const [langInput, setLangInput] = useState("");

  const addExpertise = () => {
    setForm((f) => ({
      ...f,
      subjectExpertise: [...f.subjectExpertise, { subject: "", level: "Intermediate" }],
    }));
  };

  const removeExpertise = (i) => {
    setForm((f) => ({ ...f, subjectExpertise: f.subjectExpertise.filter((_, idx) => idx !== i) }));
  };

  const updateExpertise = (i, field, value) => {
    setForm((f) => {
      const updated = [...f.subjectExpertise];
      updated[i] = { ...updated[i], [field]: value };
      return { ...f, subjectExpertise: updated };
    });
  };

  const toggleLanguage = (lang) => {
    setForm((f) => ({
      ...f,
      languagesSpoken: f.languagesSpoken.includes(lang)
        ? f.languagesSpoken.filter((l) => l !== lang)
        : [...f.languagesSpoken, lang],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/users/profile", form);
      await fetchMe();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Identity</p>
          <h1 className="section-title">My profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Expertise and languages power tutor matching — keep them current.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-teal px-5 py-2.5 flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="card p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.institutionEmail}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <CreditBadge credits={user?.knowledgeCredits} size="sm" showLabel />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ★ {user?.reputationScore?.toFixed(1) || "0.0"} reputation
                </span>
                <span className={`badge text-xs ${user?.isVerified ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                  {user?.isVerified ? "✓ Verified" : "⚠ Unverified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-4 rounded-3xl">
          <h2 className="font-bold text-gray-900 dark:text-white">Basic Information</h2>
          <div>
            <label className="label">Display Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell others about yourself, your studies, and what you're passionate about..."
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
          </div>
        </div>

        {/* Languages */}
        <div className="card p-6 rounded-3xl">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Languages Spoken</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                  form.languagesSpoken.includes(lang)
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Expertise */}
        <div className="card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Subject Expertise</h2>
            <button
              type="button"
              onClick={addExpertise}
              className="flex items-center gap-1.5 text-sm text-teal-500 hover:underline"
            >
              <Plus size={15} /> Add Subject
            </button>
          </div>
          {form.subjectExpertise.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Add subjects you can tutor others in.
            </p>
          ) : (
            <div className="space-y-3">
              {form.subjectExpertise.map((exp, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Subject (e.g., Calculus)"
                    value={exp.subject}
                    onChange={(e) => updateExpertise(i, "subject", e.target.value)}
                  />
                  <select
                    className="input w-36"
                    value={exp.level}
                    onChange={(e) => updateExpertise(i, "level", e.target.value)}
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeExpertise(i)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="card p-6 rounded-3xl">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">My Badges</h2>
          <BadgeDisplay badges={user?.badges || []} size="md" max={12} />
        </div>
      </div>
    </div>
  );
}
