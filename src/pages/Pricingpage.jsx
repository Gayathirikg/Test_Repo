import { useNavigate } from "react-router-dom";  
import API from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: "🆓",
    color: "#1e293b",
    borderColor: "#475569",
    features: [
      { text: "View Expenses", included: true },
      { text: "Add / Edit / Delete", included: true },
      { text: "Pagination", included: true },
      { text: "Filters & Sort", included: false },
      { text: "Pie Chart", included: false },
      { text: "Export CSV", included: false },
    ],
  },
  {
    key: "premium1",
    name: "Premium 1",
    price: "₹99",
    period: "per month",
    icon: "🔵",
    color: "#1e3a8a",
    borderColor: "#3b82f6",
    features: [
      { text: "View Expenses", included: true },
      { text: "Add / Edit / Delete", included: true },
      { text: "Pagination", included: true },
      { text: "Filters & Sort", included: true },
      { text: "Pie Chart", included: false },
      { text: "Export CSV", included: false },
    ],
  },
  {
    key: "premium2",
    name: "Premium 2",
    price: "₹199",
    period: "per month",
    icon: "⭐",
    color: "#4c1d95",
    borderColor: "#a855f7",
    badge: "Best Value",
    features: [
      { text: "View Expenses", included: true },
      { text: "Add / Edit / Delete", included: true },
      { text: "Pagination", included: true },
      { text: "Filters & Sort", included: true },
      { text: "Pie Chart", included: true },
      { text: "Export CSV", included: true },
    ],
  },
];
const PricingPage = () => {
const navigate = useNavigate();
const { user } = useAuth();
const currentPlan = user?.plan || "free";
 
const handleUpgrade = async (planKey) => {
  if (planKey === currentPlan) return;

  try {
    const res = await API.put("/users/update-plan", { plan: planKey });
    if (res.data.success) {
      localStorage.setItem("plan", res.data.plan);
      toast.success(`🎉 ${planKey === "premium1" ? "Premium 1" : "Premium 2"} activated!`);
      navigate("/dashboard"); 
    } else {
      toast.error(res.data.message || "Upgrade failed");
    }
  } catch {
    toast.error("Server error. Try again.");
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>💳 Choose Your Plan</h2>
        <p style={styles.subtitle}>
          Current Plan:{" "}
          <span style={styles.currentBadge}>
            {plans.find((p) => p.key === currentPlan)?.icon}{" "}
            {plans.find((p) => p.key === currentPlan)?.name}
          </span>
        </p>
      </div>

      <div style={styles.cardsRow}>
        {plans.map((plan) => {
          const isCurrentPlan = plan.key === currentPlan;
          const isDowngrade =
            (currentPlan === "premium2" && plan.key !== "premium2") ||
            (currentPlan === "premium1" && plan.key === "free");

          return (
            <div
              key={plan.key}
              style={{
                ...styles.card,
                background: plan.color,
                border: isCurrentPlan
                  ? `2px solid ${plan.borderColor}`
                  : "2px solid #334155",
                boxShadow: isCurrentPlan
                  ? `0 0 24px ${plan.borderColor}55`
                  : "0 4px 20px rgba(0,0,0,0.3)",
                transform: isCurrentPlan ? "scale(1.04)" : "scale(1)",
              }}
            >
              {plan.badge && (
                <div style={styles.bestBadge}>{plan.badge}</div>
              )}

              {isCurrentPlan && (
                <div style={{ ...styles.currentTag, borderColor: plan.borderColor, color: plan.borderColor }}>
                  ✅ Current Plan
                </div>
              )}

              <div style={styles.planIcon}>{plan.icon}</div>
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.planPrice}>{plan.price}</div>
              <div style={styles.planPeriod}>{plan.period}</div>

              <div style={styles.divider} />

              <ul style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <li key={i} style={styles.featureItem}>
                    <span style={{ color: f.included ? "#4ade80" : "#475569", fontSize: "16px" }}>
                      {f.included ? "✅" : "❌"}
                    </span>
                    <span style={{ color: f.included ? "#e2e8f0" : "#64748b", marginLeft: "10px", fontSize: "14px" }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={isCurrentPlan}
                style={{
                  ...styles.btn,
                  background: isCurrentPlan
                    ? "#334155"
                    : isDowngrade
                    ? "transparent"
                    : plan.borderColor,
                  border: isDowngrade ? "1px solid #475569" : "none",
                  color: isCurrentPlan ? "#64748b" : "white",
                  cursor: isCurrentPlan ? "not-allowed" : "pointer",
                  opacity: isCurrentPlan ? 0.7 : 1,
                }}
              >
                {isCurrentPlan ? "Current Plan" : isDowngrade ? "Downgrade" : "Upgrade →"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: "32px 20px", maxWidth: "960px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 10px" },
  subtitle: { color: "#94a3b8", fontSize: "15px" },
  currentBadge: { background: "#1e293b", border: "1px solid #3b82f6", color: "#60a5fa", padding: "3px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "14px" },
  cardsRow: { display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" },
  card: { borderRadius: "20px", padding: "32px 28px", width: "260px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" },
  bestBadge: { position: "absolute", top: "-14px", background: "#a855f7", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" },
  currentTag: { position: "absolute", top: "12px", right: "12px", border: "1px solid", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  planIcon: { fontSize: "40px", marginBottom: "10px", marginTop: "10px" },
  planName: { color: "white", fontSize: "20px", fontWeight: "800", margin: "0 0 8px" },
  planPrice: { color: "white", fontSize: "36px", fontWeight: "800", lineHeight: 1 },
  planPeriod: { color: "#94a3b8", fontSize: "13px", marginTop: "4px", marginBottom: "4px" },
  divider: { width: "100%", height: "1px", background: "rgba(255,255,255,0.1)", margin: "20px 0" },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 24px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" },
  featureItem: { display: "flex", alignItems: "center" },
  btn: { width: "100%", padding: "12px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", transition: "opacity 0.2s" },
};

export default PricingPage;