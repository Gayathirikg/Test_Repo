import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { updateUser } = useAuth(); 
  const [profile, setProfile] = useState({ username: "", email: "", phone: "", country: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setProfile(res.data.user);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load profile"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!profile.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (profile.phone && !/^\+?[0-9]{7,15}$/.test(profile.phone)) {
      toast.error("Enter a valid phone number");
      return;
    }

    try {
      const res = await API.put("/users/profile", {
        username: profile.username,
        phone: profile.phone,
      });
      if (res.data.success) {
        toast.success("Profile updated ✅");
        if (typeof updateUser === "function") {
          updateUser({ username: profile.username, email: profile.email });
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile"); 
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwords.oldPassword) {
      toast.error("Please enter your old password");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Minimum 6 characters");
      return;
    }

    try {
      const res = await API.put("/users/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        toast.success("Password changed ✅");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password"); // ✅ real error
    }
  };

  if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "40px" }}>Loading...</div>;

  return (
    <div style={styles.page}>

      <div style={styles.card}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>
            {profile.username?.[0]?.toUpperCase()}
          </div>
          <h2 style={styles.name}>{profile.username}</h2>
          <p style={styles.email}>{profile.email}</p>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleProfileUpdate} style={styles.form}>
          <h3 style={styles.sectionTitle}>✏️ Update Profile</h3>

          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />

          <label style={styles.label}>Email (cannot change)</label>
          <input
            style={{ ...styles.input, opacity: 0.5, cursor: "not-allowed" }}
            value={profile.email}
            disabled
          />

          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            type="tel" // ✅ correct input type for phone
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+91XXXXXXXXXX"
          />

          <button style={styles.btn} type="submit">Save Changes</button>
        </form>
      </div>

      {/* Password Change Card */}
      <div style={styles.card}>
        <form onSubmit={handlePasswordChange} style={styles.form}>
          <h3 style={styles.sectionTitle}>🔒 Change Password</h3>

          <label style={styles.label}>Old Password</label>
          <input
            style={styles.input}
            type="password"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
          />

          <label style={styles.label}>New Password</label>
          <input
            style={styles.input}
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />

          <label style={styles.label}>Confirm New Password</label>
          <input
            style={styles.input}
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />

          <button style={{ ...styles.btn, background: "#e74c3c" }} type="submit">
            Change Password
          </button>
        </form>
      </div>

    </div>
  );
};

const styles = {
  page: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    background: "#1e293b",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    border: "1px solid #334155",
  },
  avatarWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#1abc9c",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  name: {
    color: "white",
    margin: "0 0 4px",
    fontSize: "20px",
  },
  email: {
    color: "#94a3b8",
    margin: 0,
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sectionTitle: {
    color: "#3b82f6",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 16px",
  },
  label: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "10px",
  },
  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    color: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    background: "#3b82f6",
    border: "none",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    marginTop: "16px",
  },
};

export default Profile;