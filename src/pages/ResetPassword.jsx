import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Password required");
      return;
    }
    try {
      const res = await API.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successful!");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="card">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;