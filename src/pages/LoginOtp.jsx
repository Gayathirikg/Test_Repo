import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const LoginOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const { email, pendingToken, pendingUser } = location.state || {};

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);

  // Guard: if someone navigates here directly without going through Login
  useEffect(() => {
    if (!email || !pendingToken) {
      toast.error("Session expired. Please log in again.");
      navigate("/");
    }
  }, [email, pendingToken, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  const handleDigitChange = (index, value) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await API.post("/users/verify-login-otp", { email, otp });

      if (res.data.success) {
        // Finalise login
        localStorage.setItem("auth_Token", pendingToken);
        localStorage.setItem("plan", pendingUser.plan);
        login(pendingUser.username, pendingUser.email, pendingUser.plan);
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Invalid OTP");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setIsResending(true);
    try {
      await API.post("/users/send-login-otp", { email });
      toast.success("New OTP sent!");
      setResendCountdown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Could not resend OTP. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="card">
      <h2>Verify OTP</h2>

      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
        We sent a 6-digit code to <strong style={{ color: "#e2e8f0" }}>{email}</strong>
      </p>

      {/* 6-box OTP input */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "24px",
        }}
        onPaste={handlePaste}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isVerifying}
            style={{
              width: "44px",
              height: "52px",
              textAlign: "center",
              fontSize: "22px",
              fontWeight: "700",
              borderRadius: "10px",
              border: digit ? "2px solid #3b82f6" : "2px solid #334155",
              background: "#0f172a",
              color: "#f1f5f9",
              outline: "none",
              transition: "border-color 0.15s",
              caretColor: "transparent",
            }}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={isVerifying || digits.join("").length < OTP_LENGTH}
        style={{ width: "100%" }}
      >
        {isVerifying ? "Verifying…" : "Verify & Login"}
      </button>

      {/* Resend */}
      <p className="auth-link" style={{ marginTop: "16px" }}>
        Didn't receive it?{" "}
        {resendCountdown > 0 ? (
          <span style={{ color: "#64748b" }}>Resend in {resendCountdown}s</span>
        ) : (
          <span
            onClick={handleResend}
            style={{ cursor: isResending ? "default" : "pointer" }}
          >
            {isResending ? "Sending…" : "Resend OTP"}
          </span>
        )}
      </p>

      <p className="auth-link">
        <span onClick={() => navigate("/")}>← Back to Login</span>
      </p>
    </div>
  );
};

export default LoginOtp;