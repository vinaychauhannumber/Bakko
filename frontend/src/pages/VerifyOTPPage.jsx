import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Loader2, KeyRound } from "lucide-react";
import BakkoLogo from "../components/BakkoLogo";
import AuthImagePattern from "../components/AuthImagePattern";

const VerifyOTPPage = () => {
  const { verificationEmail, verifyOtp, isVerifyingOtp, resendOtp, isResendingOtp } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!verificationEmail) {
      navigate("/signup");
    }
  }, [verificationEmail, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtp(digits);
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return;

    const result = await verifyOtp(otpCode);
    if (result?.success) {
      navigate("/");
    }
  };

  const handleResend = () => {
    resendOtp();
  };

  if (!verificationEmail) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BakkoLogo className="size-8" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Verify Your Account</h1>
              <p className="text-base-content/60 text-sm">
                We sent a 6-digit verification code to <br />
                <span className="font-semibold text-primary">{verificationEmail}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="size-12 text-center text-xl font-bold border border-base-content/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-base-200"
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isVerifyingOtp || otp.join("").length < 6}
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="size-5" />
                  Verify Account
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Didn't receive code?{" "}
              <button
                onClick={handleResend}
                disabled={isResendingOtp}
                className="link link-primary font-medium disabled:no-underline disabled:text-zinc-500"
              >
                {isResendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Verify your identity"
        subtitle="Keep your conversations secure by verifying your email address."
      />
    </div>
  );
};

export default VerifyOTPPage;
