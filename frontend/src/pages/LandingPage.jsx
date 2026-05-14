import { Link } from "react-router-dom";
import { BookOpen, Users, Zap, Star, ArrowRight, Check, Coins, Quote, Sparkles } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Active students" },
  { value: "850+", label: "Peer tutors" },
  { value: "12K+", label: "Sessions completed" },
  { value: "4.8", label: "Avg. session rating", suffix: "★" },
];

const steps = [
  {
    step: "01",
    title: "Post a help request",
    desc: "Describe what you need, set urgency and duration. Credits are held in escrow automatically.",
    icon: "📝",
    accent: "from-teal-400/30 to-teal-600/5",
  },
  {
    step: "02",
    title: "Get matched quickly",
    desc: "Smart suggestions surface tutors by subject expertise, ratings, and language preference.",
    icon: "🎯",
    accent: "from-primary-400/30 to-primary-600/5",
  },
  {
    step: "03",
    title: "Learn in a live session",
    desc: "Chat, shared whiteboard, and notes in real time — built for short, focused breakthroughs.",
    icon: "💡",
    accent: "from-gold-400/25 to-gold-600/5",
  },
  {
    step: "04",
    title: "Earn by teaching",
    desc: "Accept requests in your strengths. Earn Knowledge Credits every time you help someone succeed.",
    icon: "🏆",
    accent: "from-violet-400/25 to-violet-600/5",
  },
];

const features = [
  "Start with 20 free credits on signup",
  "No real money — pure knowledge economy",
  "Verified institution emails",
  "Real-time chat + shared whiteboard",
  "Badges, streaks & leaderboard",
  "Smart tutor matching",
];

const testimonials = [
  { quote: "I finally understood recursion after a 25-minute session. Way better than scrolling forums.", name: "Priya M.", role: "CS sophomore", avatar: "PM" },
  { quote: "Teaching integration on LearnLoop made me confident for my own exams. Win-win.", name: "Jordan L.", role: "Math tutor", avatar: "JL" },
  { quote: "Credits feel fair. I teach stats, I get help for ML. The loop actually works.", name: "Alex R.", role: "Grad student", avatar: "AR" },
];

const activity = [
  { user: "Maya", action: "posted", topic: "Organic chemistry — resonance", time: "2m ago" },
  { user: "Chris", action: "completed session", topic: "Python list comprehensions", time: "6m ago" },
  { user: "Sam", action: "earned badge", topic: "First Teach 🎓", time: "14m ago" },
  { user: "Elena", action: "accepted request", topic: "Class 12 trigonometry", time: "22m ago" },
  { user: "Dev", action: "joined leaderboard", topic: "Top 10 this week", time: "31m ago" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-glow ring-2 ring-teal-500/20 group-hover:scale-105 transition-transform">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary-700 dark:text-white tracking-tight">
              LearnLoop
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="btn-ghost text-sm px-3">
              Sign in
            </Link>
            <Link to="/register" className="btn-teal text-sm px-5 py-2 shadow-soft">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-hero-auth" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,212,191,0.25),transparent)]" />
        <div className="absolute top-24 left-[10%] w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-[5%] w-96 h-96 bg-primary-400/15 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/95 backdrop-blur-md mb-8">
            <Sparkles size={15} className="text-gold-300" />
            Peer-to-peer knowledge exchange
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
            Learn. Teach.{" "}
            <span className="bg-gradient-to-r from-teal-200 via-white to-gold-200 bg-clip-text text-transparent">
              Grow together.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Exchange help using Knowledge Credits — not cash. Get unstuck fast from peers who just mastered what you are learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-primary-800 font-bold px-8 py-4 shadow-soft-lg hover:bg-teal-50 transition-colors text-base"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 text-white font-semibold px-8 py-4 hover:bg-white/10 backdrop-blur-sm transition-colors text-base"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-white/50 text-sm">
            Institution email · 20 starter credits · Built for students
          </p>
        </div>
      </section>

      <section className="relative py-14 border-y border-slate-200/80 bg-white/80 dark:bg-slate-900/60 dark:border-slate-800 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-6">
            Live community pulse
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
            {activity.map((a) => (
              <span key={a.user + a.time} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <strong className="text-slate-900 dark:text-white">{a.user}</strong> {a.action}{" "}
                <span className="text-slate-400">· {a.topic}</span>
                <span className="text-slate-400 text-xs">{a.time}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:to-teal-500">
                {s.value}{s.suffix}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            How LearnLoop works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            A credit-based loop that rewards both sides of the desk.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/60 dark:bg-slate-900/80 overflow-hidden group hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="text-4xl mb-4">{step.icon}</div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tracking-[0.2em] uppercase">
                  Step {step.step}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.4),transparent_50%)]" />
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-5 tracking-tight">
              Knowledge Credits — <span className="text-gold-300">not cash</span>
            </h2>
            <p className="text-white/75 text-lg mb-8 leading-relaxed">
              Our currency is knowledge. Spend credits to learn, earn them by teaching. The more you give, the more you can ask for later.
            </p>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 rounded-full bg-teal-400/30 flex items-center justify-center flex-shrink-0 ring-1 ring-teal-300/50">
                    <Check size={12} className="text-teal-200" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>Example session costs (60 min)</span>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold">Transparent</span>
            </div>
            {[
              { label: "Low urgency", cost: 2, color: "text-emerald-300" },
              { label: "Medium urgency", cost: 3, color: "text-amber-200" },
              { label: "High urgency", cost: 4, color: "text-orange-200" },
              { label: "Urgent", cost: 6, color: "text-red-200" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5"
              >
                <span className="text-white/85 text-sm">{r.label}</span>
                <span className={`font-bold flex items-center gap-1.5 ${r.color}`}>
                  <Coins size={15} /> {r.cost} credits
                </span>
              </div>
            ))}
            <p className="text-white/45 text-xs text-center pt-2">
              Tutors earn ~90% of credits spent · Platform reserve covers matching &amp; quality
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Loved by students on campus
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">
              Sample voices from our design community — your campus could be next.
            </p>
          </div>
          <div className="flex items-center gap-2 text-gold-500 font-semibold">
            <Star size={20} className="fill-gold-500" />
            4.8 average session rating
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900/80 flex flex-col"
            >
              <Quote className="absolute top-5 right-5 text-teal-500/20" size={40} />
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1 relative z-10">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-60" />
        <div className="max-w-2xl mx-auto relative">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-primary-600 text-2xl mb-6 shadow-glow">
            🚀
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Ready to join the loop?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
            Sign up, verify your institution email, and start with 20 free credits.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold px-10 py-4 shadow-soft-lg hover:from-primary-500 hover:to-primary-600 transition-all"
          >
            Create free account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-4 text-center text-sm text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-950/80">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-primary-700 dark:text-slate-300">LearnLoop</span>
        </div>
        <p>Built for students · Learn. Teach. Grow together.</p>
      </footer>
    </div>
  );
}
