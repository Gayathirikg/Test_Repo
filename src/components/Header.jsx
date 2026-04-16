import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: "45px", height: "45px", objectFit: "contain" }}
        />
        <h2 className="header-logo">Expense Tracker</h2>
      </div>

      <nav className="header-nav">
        {!user && (
          <>
            <Link className="header-link" to="/register">
              Register
            </Link>
            <Link className="header-link" to="/">
              Login
            </Link>
          </>
        )}

        {user && (
          <>
            <Link className="header-link" to="/dashboard">
              Dashboard
            </Link>

            <div
              className="header-avatar-wrap"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <div className="header-avatar">
                {user.username[0].toUpperCase()}
              </div>

              {showTooltip && (
                <div
                  className="header-tooltip"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <p className="header-drop-name">{user.username}</p>
                  <p className="header-drop-email">{user.email}</p>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid #ecf0f1",
                      margin: "10px 0",
                    }}
                  />
                  <Link
                    to="/profile"
                    style={{
                      color: "#3b82f6",
                      fontSize: "13px",
                      textDecoration: "none",
                    }}
                    onClick={() => setShowTooltip(false)}
                  >
                    👤 View Profile
                  </Link>
                </div>
              )}
            </div>

            <button className="header-logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </nav>

      <Link
        to="/pricing"
        style={{
          color: "#a855f7",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "14px",
          border: "1px solid #a855f7",
          padding: "6px 14px",
          borderRadius: "20px",
        }}
      >
        💳 Plans
      </Link>
    </header>
  );
};

export default Header;
