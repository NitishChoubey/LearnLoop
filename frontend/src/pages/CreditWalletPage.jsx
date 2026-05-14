import { useEffect, useState } from "react";
import { Coins, TrendingUp, TrendingDown, Gift, Loader2, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import CreditBadge from "../components/CreditBadge";

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
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Coins size={26} className="text-gold-500" />
          Credit Wallet
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your complete credit history and balance
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-teal-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <p className="text-sm font-medium text-white/70 mb-1">Current Balance</p>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-bold font-['Poppins']">{user?.knowledgeCredits}</span>
          <span className="text-white/70 text-lg">credits</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Total Earned</p>
            <p className="font-bold text-green-300">+{totalEarned}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Total Spent</p>
            <p className="font-bold text-red-300">-{totalSpent}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Bonuses</p>
            <p className="font-bold text-gold-300">+{totalBonus}</p>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-teal-500" />
          How to Earn More Credits
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {HOW_TO_EARN.map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
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
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Transaction History</h2>
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
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
