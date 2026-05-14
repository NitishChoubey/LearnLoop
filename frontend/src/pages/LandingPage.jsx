import { Link } from "react-router-dom";
import { BookOpen, Users, Zap, Star, ArrowRight, Check, Coins } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Active Students" },
  { value: "850+", label: "Peer Tutors" },
  { value: "12K+", label: "Sessions Completed" },
  { value: "4.8★", label: "Average Rating" },
];

const steps = [
  {
    step: "01",
    title: "Post a Help Request",
    desc: "Describe what you need help with, set urgency and duration. Credits are held in escrow automatically.",
    icon: "📝",
  },
  {
    step: "02",
    title: "Get Matched Instantly",
    desc: "Our smart algorithm finds the best-matched peer tutor based on expertise, ratings, and language preference.",
    icon: "🎯",
  },
  {
    step: "03",
    title: "Learn in a Live Session",
    desc: "Join a real-time session with chat, shared whiteboard, and notes. Learn from someone who just mastered it.",
    icon: "💡",
  },
  {
    step: "04",
    title: "Earn by Teaching",
    desc: "Accept requests in your expertise areas. Earn Knowledge Credits every time you help someone succeed.",
    icon: "🏆",
  },
];

const features = [
  "Start with 20 free credits on signup",
  "No real money — pure knowledge economy",
  "Verified institution emails only",
  "Real-time chat + shared whiteboard",
  "Gamification: badges, streaks & leaderboard",
  "Smart AI-powered tutor matching",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-500 dark:text-white font-['Poppins']">
              LearnLoop
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-teal text-sm px-5 py-2"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Zap size={14} className="text-gold-400" />
            Peer-to-Peer Knowledge Exchange Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight font-['Poppins'] mb-6">
            Learn. Teach.{" "}
            <span className="text-teal-300">Grow Together.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Exchange knowledge with your peers using credits — not cash.
            Get help from students who just mastered what you're struggling with.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-base"
            >
              Start for Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-5 text-white/60 text-sm">
            Join with your institution email · Get 20 free credits instantly
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-primary-500 dark:text-teal-400 font-['Poppins']">
                {s.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white font-['Poppins'] mb-4">
            How LearnLoop Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            A simple, credit-based system that rewards both learners and teachers.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <span className="text-xs font-bold text-teal-500 tracking-widest uppercase">
                Step {step.step}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Credit System */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-500 to-teal-600">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white font-['Poppins'] mb-5">
              Knowledge Credits —{" "}
              <span className="text-gold-300">Not Cash</span>
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Our currency is knowledge. Every student starts with 20 free credits.
              Spend them to learn, earn them by teaching. The more you give, the more you get.
            </p>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Spending Formula</span>
              <div className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">Transparent</div>
            </div>
            {[
              { label: "Low urgency · 60 min", cost: 2, color: "text-green-300" },
              { label: "Medium urgency · 60 min", cost: 3, color: "text-yellow-300" },
              { label: "High urgency · 60 min", cost: 4, color: "text-orange-300" },
              { label: "URGENT · 60 min", cost: 6, color: "text-red-300" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
              >
                <span className="text-white/80 text-sm">{r.label}</span>
                <span className={`font-bold flex items-center gap-1 ${r.color}`}>
                  <Coins size={14} /> {r.cost} credits
                </span>
              </div>
            ))}
            <p className="text-white/50 text-xs text-center pt-2">
              Tutors earn 90% of the credits spent · 10% platform reserve
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <span className="text-5xl mb-6 block">🚀</span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white font-['Poppins'] mb-4">
            Ready to join the loop?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
            Sign up with your institution email, get 20 free credits, and start learning or teaching today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-bold px-10 py-4 rounded-xl hover:bg-primary-600 transition-colors text-base"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 text-center text-sm text-gray-400 dark:text-gray-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center">
            <BookOpen size={12} className="text-white" />
          </div>
          <span className="font-bold text-primary-500 dark:text-gray-400">LearnLoop</span>
        </div>
        <p>Built for students, by students · Hackathon 2026</p>
      </footer>
    </div>
  );
}
