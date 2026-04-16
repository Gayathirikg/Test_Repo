import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ← ADD
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_Token");
    if (token) {
      API.get("/users/get-user")
        .then((res) => {
          if (res.data.success) setUser(res.data.user);
        })
        .finally(() => setAuthLoading(false)); // ← ADD
    } else {
      setAuthLoading(false); // ← ADD
    }
  }, []);

  const login = (username, email, plan, token) => {
    setUser({ username, email, plan });
    localStorage.setItem("auth_Token", token); // ← new line
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_Token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}> // ← ADD authLoading
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);