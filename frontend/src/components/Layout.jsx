import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Search, PlusCircle, ListChecks, Trophy,
  Bell, Wallet, User, LogOut, BookOpen, Menu, X, Moon, Sun,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useNotificationStore from "../store/useNotificationStore";
import CreditBadge from "./CreditBadge";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/requests", icon: Search, label: "Browse requests" },
  { to: "/requests/new", icon: PlusCircle, label: "Post request" },
  { to: "/my-requests", icon: ListChecks, label: "My requests" },
  { to: "/sessions", icon: BookOpen, label: "My sessions" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-mesh-light dark:bg-mesh-dark text-slate-800 dark:text-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 flex flex-col border-r border-white/10 bg-gradient-to-b from-primary-700 via-primary-800 to-slate-950 shadow-soft-lg transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60 pointer-events-none" />

        <div className="relative flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-glow ring-2 ring-white/20">
            <BookOpen size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-lg text-white tracking-tight block truncate">LearnLoop</span>
            <span className="text-xs text-teal-200/90 font-medium">Knowledge economy</span>
          </div>
          <button
            type="button"
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md px-3 py-3 ring-1 ring-white/10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner-glow">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <CreditBadge credits={user?.knowledgeCredits} size="sm" />
            </div>
          </div>
        </div>

        <nav className="relative flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-white text-primary-800 shadow-soft [&_svg]:text-teal-600"
                  : "text-white/75 hover:bg-white/10 hover:text-white [&_svg]:text-teal-300/80"
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {label === "Notifications" && unreadCount > 0 && (
                <span className="bg-gold-500 text-primary-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative px-3 py-4 border-t border-white/10 space-y-1">
          <button
            type="button"
            onClick={toggleDark}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white w-full transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-200/90 hover:bg-red-500/20 hover:text-white w-full transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-primary-700 dark:text-white truncate">LearnLoop</span>
          </div>
          <div className="ml-auto">
            <CreditBadge credits={user?.knowledgeCredits} size="sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
