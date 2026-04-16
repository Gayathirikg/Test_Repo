import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email required");
      return;
    }
    try {
      const res = await API.post("/users/forgot-password", { email });
      if (res.data.success) {
        toast.success("OTP sent to your email!");
        navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send OTP</button>
      </form>
      <p className="auth-link">
        Back to <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default ForgotPassword;