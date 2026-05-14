import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { user, verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (user?.isVerified) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    const result = await verifyOtp(otp);
    if (result.success) {
      toast.success("Email verified! Welcome to LearnLoop.");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    const result = await resendOtp();
    if (result.success) {
      toast.success("New OTP sent to your institution email");
      setResendCooldown(60);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-light dark:bg-mesh-dark">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-primary-700 flex items-center justify-center shadow-glow ring-2 ring-white/30">
              <BookOpen size={24} className="text-white" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold px-3 py-1 mb-4">
            <ShieldCheck size={14} />
            Secure verification
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Check your inbox</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-sm mx-auto">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.institutionEmail}</span>
          </p>
        </div>

        <div className="card p-8 sm:p-10 shadow-soft-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-10" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className={`w-11 sm:w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-display
                    ${d
                      ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"
                      : "border-slate-200 dark:border-slate-600 focus:border-teal-500"
                    }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || digits.join("").length !== 6}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & continue"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              <RotateCcw size={14} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800/50 px-4 py-3 text-xs text-amber-900 dark:text-amber-200/90 text-center leading-relaxed">
            Code expires in 10 minutes. Check spam if you don&apos;t see it.
          </div>
        </div>
      </div>
    </div>
  );
}
