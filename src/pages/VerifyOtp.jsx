import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP required");
      return;
    }
    try {
      const res = await API.post("/users/verify-otp", { email, otp });
      if (res.data.success) {
        toast.success("OTP verified!");
        navigate("/reset-password", { state: { email, otp } });
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="card">
      <h2>Verify OTP</h2>
      <p>OTP sent to: <b>{email}</b></p>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="submit">Verify OTP</button>
      </form>
      <p className="auth-link">
        Back to <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default VerifyOtp;