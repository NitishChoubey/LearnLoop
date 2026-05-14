import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-hero-auth overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(45,212,191,0.35),transparent)]" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-teal-500/15 rounded-full blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white/90 hover:text-white transition-colors">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">LearnLoop</span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-white/15 mb-6">
            <Sparkles size={14} /> Peer learning OS
          </div>
          <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Pick up where you left off.
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            Your sessions, credits, and badges sync across devices. Sign in to jump back into the loop.
          </p>
        </div>
        <p className="relative text-white/40 text-sm">© LearnLoop</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-mesh-light dark:bg-mesh-dark min-h-[100dvh] lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-glow">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">LearnLoop</span>
            </Link>
          </div>

          <div className="card p-8 sm:p-10 shadow-soft-lg border-slate-200/90 dark:border-slate-700/80">
            <div className="mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to continue your learning loop</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New here?{" "}
                <Link to="/register" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-50 to-primary-50 dark:from-teal-950/40 dark:to-primary-950/30 px-4 py-3 text-center text-xs text-slate-600 dark:text-teal-200/90">
              <strong className="text-teal-700 dark:text-teal-300">Demo:</strong> alice@example.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
