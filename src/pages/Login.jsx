import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

    try {
      const res = await API.post("/users/login", { email, password });
      if (res.data.success) {
        console.log("TOKEN FROM SERVER:", res.data.token); // keep this for now

        if (!res.data.token) {
          toast.error("No token received from server");
          return; // ← stop here so we can see the problem
        }
        localStorage.setItem("auth_Token", res.data.token);
        console.log("SAVED TOKEN:", localStorage.getItem("auth_Token"));
        localStorage.setItem("plan", res.data.user.plan);
        login(res.data.user.username, res.data.user.email, res.data.user.plan);
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter || 60;
        setIsBlocked(true);
        startCountdown(seconds);
        toast.error(
          error.response.data.message || "Too many attempts. Please wait.",
        );
        return;
      }

      toast.error("Server error");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {isBlocked && (
          <p style={{ color: "red", fontSize: "13px" }}>
            Too many attempts. Try again in <strong>{countdown}s</strong>
          </p>
        )}

        <button type="submit" disabled={isBlocked}>
          {isBlocked ? `Wait ${countdown}s` : "Login"}
        </button>
      </form>

      <p className="auth-link">
        Don't have an account?
        <span onClick={() => navigate("/register")}>Create Account</span>
      </p>

      <p className="auth-link">
        Forgot Password?
        <span onClick={() => navigate("/forgot-password")}>Click Here</span>
      </p>
    </div>
  );
};

export default Login;
