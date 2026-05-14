import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Loader2, Check, Gift, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

const requirements = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", institutionEmail: "" });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success("Account created! Check your institution email for the OTP.");
      navigate("/verify-otp");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-teal-700 via-primary-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,166,35,0.2),transparent_45%)]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white/90 hover:text-white">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">LearnLoop</span>
          </Link>
        </div>
        <div className="relative max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur px-4 py-3 ring-1 ring-white/15 text-white">
            <Gift className="text-gold-300 shrink-0" size={22} />
            <div>
              <p className="font-display font-bold text-sm">20 starter credits</p>
              <p className="text-xs text-white/70">After you verify your institution email</p>
            </div>
          </div>
          <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight">
            Your campus. Your expertise. Your currency.
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            Join verified students teaching and learning in short, focused sessions — with chat and a shared whiteboard.
          </p>
        </div>
        <p className="relative text-white/40 text-sm">Learn. Teach. Grow together.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-mesh-light dark:bg-mesh-dark min-h-[100dvh] lg:min-h-0 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">LearnLoop</span>
            </Link>
          </div>

          <div className="card p-8 sm:p-10 shadow-soft-lg">
            <div className="mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Takes about a minute — then verify your school email.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Institution email
                  <span className="text-teal-600 dark:text-teal-400 ml-1 text-xs font-normal">(OTP sent here)</span>
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@university.edu"
                  value={form.institutionEmail}
                  onChange={(e) => setForm({ ...form, institutionEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input pr-12"
                    placeholder="Create a strong password"
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
                {form.password && (
                  <div className="mt-2 space-y-1">
                    {requirements.map((r) => (
                      <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(form.password) ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}>
                        <Check size={12} className={r.test(form.password) ? "opacity-100" : "opacity-30"} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-2 rounded-xl text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
