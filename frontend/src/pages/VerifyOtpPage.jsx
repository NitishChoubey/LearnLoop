import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, RotateCcw } from "lucide-react";
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
      toast.success("Email verified! Welcome to LearnLoop 🎉");
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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Verify Your Email</h1>
          <p className="text-white/70 mt-2 text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-white">{user?.institutionEmail}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none
                    ${d
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-gray-200 dark:border-gray-600 focus:border-teal-500"
                    }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || digits.join("").length !== 6}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-500 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              <RotateCcw size={14} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>

          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400 text-center">
            The OTP expires in 10 minutes. Check your spam folder if needed.
          </div>
        </div>
      </div>
    </div>
  );
}
