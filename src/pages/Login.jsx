import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState("credentials"); // "credentials" | "sending"

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields required");
      return;
    }

    setStep("sending");

    try {
      // Step 1: Verify credentials
      const res = await API.post("/users/login", { email, password });

      if (!res.data.success) {
        setStep("credentials");
        toast.error(res.data.message || "Invalid credentials");
        return;
      }

      // Step 2: Trigger OTP to email
      // The server sends an OTP email; we pass the token temporarily in state
      // so LoginOtp can finalise the login after OTP verification.
      const pendingToken = res.data.token;
      const pendingUser = res.data.user;

      await API.post("/users/send-login-otp", { email });

      toast.success("OTP sent to your email!");
      navigate("/login-otp", { state: { email, pendingToken, pendingUser } });
    } catch (error) {
      setStep("credentials");

      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter || 60;
        setIsBlocked(true);
        startCountdown(seconds);
        toast.error(error.response.data.message || "Too many attempts. Please wait.");
        return;
      }

      toast.error("Server error. Please try again.");
    }
  };

  const isSending = step === "sending";

  return (
    <div className="card">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSending}
        />

        {isBlocked && (
          <p style={{ color: "red", fontSize: "13px" }}>
            Too many attempts. Try again in <strong>{countdown}s</strong>
          </p>
        )}

        <button type="submit" disabled={isBlocked || isSending}>
          {isSending ? "Sending OTP…" : isBlocked ? `Wait ${countdown}s` : "Continue →"}
        </button>
      </form>

      <p className="auth-link">
        Don't have an account?{" "}
        <span onClick={() => navigate("/register")}>Create Account</span>
      </p>

      <p className="auth-link">
        Forgot Password?{" "}
        <span onClick={() => navigate("/forgot-password")}>Click Here</span>
      </p>
    </div>
  );
};

export default Login;