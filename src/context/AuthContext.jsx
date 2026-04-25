import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_Token");
    if (token) {
      API.get("/users/get-user")
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            // Token invalid — clean up
            localStorage.removeItem("auth_Token");
            localStorage.removeItem("plan");
          }
        })
        .catch(() => {
          localStorage.removeItem("auth_Token");
          localStorage.removeItem("plan");
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = (username, email, plan) => {
    // 🔑 Token already localStorage-ல் set ஆகிடுச்சு (Login/Register page-ல்)
    // இங்க user state மட்டும் update பண்றோம்
    setUser({ username, email, plan });
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("plan", plan);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_Token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("plan");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);