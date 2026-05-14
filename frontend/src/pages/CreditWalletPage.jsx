import { useEffect, useState } from "react";
import { Coins, TrendingUp, TrendingDown, Gift, Loader2, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";

const TYPE_CONFIG = {
  EARNED: { icon: <TrendingUp size={16} />, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", sign: "+" },
  SPENT: { icon: <TrendingDown size={16} />, color: "text-red-500 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", sign: "-" },
  BONUS: { icon: <Gift size={16} />, color: "text-gold-600 dark:text-gold-400", bg: "bg-gold-100 dark:bg-gold-900/30", sign: "+" },
};

const HOW_TO_EARN = [
  { icon: "🎓", title: "Accept help requests", desc: "Earn credits by tutoring students in your expertise areas." },
  { icon: "⚡", title: "Accept urgent requests", desc: "Urgent requests pay more due to higher multipliers (up to 3×)." },
  { icon: "🔥", title: "Maintain a teaching streak", desc: "Consistent daily tutoring builds reputation and unlocks bonuses." },
  { icon: "🏆", title: "Reach the leaderboard", desc: "Top contributors may receive bonus credits from the platform." },
];

export default function CreditWalletPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/credits/history?page=${page}&limit=${LIMIT}`);
        setTransactions(res.data.transactions);
        setStats(res.data.stats);
        setTotal(res.data.total);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const totalEarned = stats.find((s) => s.type === "EARNED")?._sum?.amount || 0;
  const totalSpent = stats.find((s) => s.type === "SPENT")?._sum?.amount || 0;
  const totalBonus = stats.find((s) => s.type === "BONUS")?._sum?.amount || 0;

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 mb-2">Economy</p>
        <h1 className="section-title flex items-center gap-3">
          <Coins size={28} className="text-gold-500" />
          Credit wallet
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
          Balance, bonuses, and every credit moving through your account.
        </p>
      </div>

      <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-teal-700 shadow-soft-lg ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <p className="text-sm font-medium text-white/70 mb-1 relative">Current balance</p>
        <div className="flex items-baseline gap-2 mb-8 relative">
          <span className="text-5xl sm:text-6xl font-bold font-display tracking-tight">{user?.knowledgeCredits}</span>
          <span className="text-white/70 text-lg font-medium">credits</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm relative">
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm ring-1 ring-white/10">
            <p className="text-white/65 text-xs mb-1 font-medium">Earned</p>
            <p className="font-bold text-emerald-200 font-display">+{totalEarned}</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm ring-1 ring-white/10">
            <p className="text-white/65 text-xs mb-1 font-medium">Spent</p>
            <p className="font-bold text-rose-200 font-display">-{totalSpent}</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm ring-1 ring-white/10">
            <p className="text-white/65 text-xs mb-1 font-medium">Bonuses</p>
            <p className="font-bold text-amber-200 font-display">+{totalBonus}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 sm:p-7 mb-8 rounded-3xl">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <TrendingUp size={20} className="text-teal-500" />
          How to earn more
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {HOW_TO_EARN.map((item) => (
            <div key={item.title} className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/requests"
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal-500 hover:underline"
        >
          <ArrowUpRight size={15} /> Browse open requests to tutor
        </Link>
      </div>

      {/* Transaction History */}
      <div className="card p-6 sm:p-7 rounded-3xl">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5">Transaction history</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-teal-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600">
            <Coins size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {transactions.map((tx) => {
                const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.BONUS;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {tx.reason}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(tx.timestamp), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                    <span className={`font-bold text-sm flex-shrink-0 ${cfg.color}`}>
                      {cfg.sign}{tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>

            {total > LIMIT && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
                  {page} / {Math.ceil(total / LIMIT)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(total / LIMIT), p + 1))}
                  disabled={page === Math.ceil(total / LIMIT)}
                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
