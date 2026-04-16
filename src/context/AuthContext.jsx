import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api"; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  
 useEffect(() => {
  const token = localStorage.getItem("auth_Token");
  if (token) {
    API.get("/users/get-user").then((res) => {
      if (res.data.success) {
        setUser(res.data.user); 
      }
    });
  }
}, []);

  const login = (username, email,plan) => {
    setUser({ username, email ,plan });
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);