import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../App.css";


const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    country: "+91",
    phone: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    setErrors({});

    if (!form.username) newErrors.username = "Username required";
    if (!form.email) newErrors.email = "Email required";
    if (!form.phone) newErrors.phone = "Phone required";
    if (!form.password) newErrors.password = "Password required";

    if (form.password && form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (form.phone && form.phone.length !== 10) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const fullPhone = form.country + form.phone;

      const res = await API.post("/users/register", {
        ...form,
        phone: fullPhone
      });

      if (res.data.success) {
        toast.success("Registered successfully ✅");
        setTimeout(() => navigate("/"), 1500);
      } else {
        const msg = res.data.message.toLowerCase();
        if (msg.includes("email")) {
          setErrors({ email: res.data.message });
        } else if (msg.includes("phone")) {
          setErrors({ phone: res.data.message });
        } else {
          setErrors({ api: res.data.message });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message?.toLowerCase() || "";
      if (msg.includes("email")) {
        setErrors({ email: "Email already exists" });
      } else if (msg.includes("phone")) {
        setErrors({ phone: "Phone already exists" });
      } else {
        setErrors({ api: "Server error" });
      }
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <div className="phone-row">
          <select name="country" onChange={handleChange}>
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
          </select>
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
          />
        </div>
        {errors.phone && <p className="error">{errors.phone}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {errors.api && <p className="error">{errors.api}</p>}

        <button type="submit" className="register-btn">Register</button>

      </form>

      <p className="auth-link">
        Already have an account?
        <span onClick={() => navigate("/")}>Login</span>
      </p>
    </div>
  );
};

export default Register;