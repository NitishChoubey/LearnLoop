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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Trophy size={26} className="text-gold-500" />
            Leaderboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Top tutors ranked by reputation score and sessions taught
          </p>
        </div>
        <select
          className="input w-full sm:w-48"
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
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {[users[1], users[0], users[2]].map((u, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            return (
              <div key={u.id} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                  {u.profilePicture
                    ? <img src={u.profilePicture} alt={u.name} className="w-full h-full rounded-full object-cover" />
                    : u.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center truncate w-full px-1">
                  {u.name}
                </p>
                <div className={`w-full ${heights[podiumIdx]} rounded-t-xl flex items-center justify-center text-2xl font-bold
                  ${rank === 1 ? "bg-gold-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"} text-white`}>
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
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No tutors yet</p>
          <p className="text-sm mt-1">Complete sessions to appear on the leaderboard.</p>
        </div>
      )}
    </div>
  );
}
