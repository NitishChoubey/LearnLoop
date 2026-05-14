import { useEffect, useState } from "react";
import { Trophy, Loader2, Search } from "lucide-react";
import api from "../lib/api";
import LeaderboardRow from "../components/LeaderboardRow";

const SUBJECTS = ["", "Mathematics", "Physics", "Chemistry", "Computer Science", "Biology", "Statistics", "Data Science", "Machine Learning", "Algorithms"];

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 20 });
    if (subject) params.append("subject", subject);
    api.get(`/users/leaderboard?${params}`)
      .then((r) => setUsers(r.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 mb-2">Compete kindly</p>
          <h1 className="section-title flex items-center gap-3">
            <Trophy size={30} className="text-gold-500 drop-shadow-sm" />
            Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg">
            Top verified tutors by reputation and sessions taught. Filter by subject to find specialists.
          </p>
        </div>
        <select
          className="input w-full sm:w-56 shadow-sm font-medium"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s || "All Subjects"}</option>
          ))}
        </select>
      </div>

      {/* Podium — top 3 */}
      {!loading && users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {[users[1], users[0], users[2]].map((u, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-28", "h-36", "h-24"];
            return (
              <div key={u.id} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-soft-lg ring-4 ring-white/30 dark:ring-slate-900/50">
                  {u.profilePicture
                    ? <img src={u.profilePicture} alt="" className="w-full h-full rounded-2xl object-cover" />
                    : u.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center truncate w-full px-1">
                  {u.name}
                </p>
                <div className={`w-full ${heights[podiumIdx]} rounded-t-2xl flex items-center justify-center text-3xl font-display font-black shadow-inner
                  ${rank === 1 ? "bg-gradient-to-b from-gold-400 to-amber-500" : rank === 2 ? "bg-gradient-to-b from-slate-300 to-slate-400" : "bg-gradient-to-b from-amber-600 to-orange-700"} text-white`}>
                  {["🥇", "🥈", "🥉"][rank - 1]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map((u, i) => (
            <LeaderboardRow key={u.id} user={u} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="card rounded-3xl text-center py-20 text-slate-500 dark:text-slate-400">
          <Trophy size={52} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-200">No tutors in this filter yet</p>
          <p className="text-sm mt-2 max-w-md mx-auto">Complete sessions as a tutor to appear here, or clear the subject filter.</p>
        </div>
      )}
    </div>
  );
}
