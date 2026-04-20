import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { useAuth } from "../context/AuthContext";
const ExpenseList = ({ refresh }) => {
   const { user } = useAuth();
  const USER_PLAN = user?.plan || "free";
  
  const [expenses, setExpenses] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [editData, setEditData] = useState({ title: "", amount: "", category: "", date: "" });
  const [newImages, setNewImages] = useState([]);
  const [fileKey, setFileKey] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTitle, setSearchTitle] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allExpenses, setAllExpenses] = useState([]);
  const [showChart, setShowChart] = useState(false);

  const LIMIT = 5;
  const totalpages = Math.ceil(totalCount / LIMIT) || 1;

  const isPremium1 = USER_PLAN === "premium1" || USER_PLAN === "premium2";
  const isPremium2 = USER_PLAN === "premium2";

  const fetchExpenses = async (pageNum = 1) => {
    try {
      const params = { limit: LIMIT, page: pageNum };
      if (searchTitle) params.title = searchTitle;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (sortBy !== "createdAt") params.sort = sortBy;
      const res = await API.get("/expenses", { params });
      setExpenses(res.data.expenses);
      setTotalCount(res.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllForChart = async () => {
    try {
      const res = await API.get("/expenses", { params: { limit: 1000, page: 1 } });
      setAllExpenses(res.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses(page);
    if (isPremium2) fetchAllForChart();
  }, [refresh, page, selectedCategory, searchTitle, minAmount, maxAmount, fromDate, toDate, sortBy]);

  useEffect(() => {
  if (isPremium2) {
    fetchAllForChart();
  }
}, [isPremium2]);

  // ── Pie chart data 
 const pieData = ["Food", "Travel", "Shopping", "Bills", "Other"]
  .map((cat) => ({
    name: cat,
    value: allExpenses
      .filter((e) => e.category?.toLowerCase() === cat.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0),
  }))
  .filter((d) => d.value > 0);

  // ── Export CSV (Premium 2 only) ──
  const handleExportCSV = () => {
    const headers = ["Title", "Amount", "Category", "Date"];
    const rows = allExpenses.map((e) => [
      e.title,
      e.amount,
      e.category,
      e.date ? new Date(e.date).toLocaleDateString("en-IN") : "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditClick = (expense) => {
    setEditExpense(expense);
    setNewImages([]);
    setFileKey((prev) => prev + 1);
    setEditData({
      title: expense.title, amount: expense.amount, category: expense.category,
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
    });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editData.title);
      formData.append("amount", editData.amount);
      formData.append("category", editData.category);
      formData.append("date", editData.date);
      newImages.forEach((img) => formData.append("billImage", img));
      await API.put(`/expenses/${editExpense._id}`, formData);
      toast.success("Expense Updated ✅");
      setEditExpense(null);
      setNewImages([]);
      fetchExpenses(page);
      if (isPremium2) fetchAllForChart();
    } catch { toast.error("Failed to update"); }
  };

  const handleDeleteYes = async () => {
    try {
      await API.delete(`/expenses/${deleteConfirmId}`);
      toast.success("Expense Deleted!");
      setDeleteConfirmId(null);
      fetchExpenses(page);
      if (isPremium2) fetchAllForChart();
    } catch { toast.error("Failed to delete"); }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ marginTop: "28px" }}>

      {/* ── HEADER ── */}
      <div style={styles.headerRow}>
        <h3 style={styles.headerTitle}>💸 Expense List</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={styles.badge}>{totalCount} records</span>

          {/* Premium 2: Chart toggle */}
          {isPremium2 && (
            <button
              onClick={() => setShowChart((v) => !v)}
              style={{
                ...styles.actionBtn,
                background: showChart ? "#3b82f6" : "transparent",
                borderColor: "#3b82f6",
                color: showChart ? "white" : "#60a5fa",
              }}
            >
              {showChart ? "📊 Hide Chart" : "📊 Show Chart"}
            </button>
          )}

          {/* Premium 2: Export */}
          {isPremium2 && (
            <button onClick={handleExportCSV} style={{ ...styles.actionBtn, borderColor: "#22c55e", color: "#4ade80" }}>
              ⬇️ Export CSV
            </button>
          )}

          {/* Plan badge */}
          <span style={{
            ...styles.planBadge,
            background: isPremium2 ? "#7c3aed" : isPremium1 ? "#1e40af" : "#334155",
          }}>
            {isPremium2 ? "⭐ Premium 2" : isPremium1 ? "🔵 Premium 1" : "Free"}
          </span>
        </div>
      </div>

      {/* ── CHART (Premium 2 only) ── */}
      {isPremium2 && showChart && (
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>📊 Spending by Category</h4>
          {pieData.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>No data to display</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white" }} />
                <Legend formatter={(value) => <span style={{ color: "#e2e8f0" }}>{categoryIcons[value]} {value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── TOTAL CARD ── */}
      <div style={styles.totalCard}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>💰 Total Expenses</span>
        <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "22px" }}>₹{total}</span>
      </div>

      {/* ── FILTERS (Premium 1 + Premium 2) ── */}
      {isPremium1 && (
        <div style={styles.filterRow}>
          <input type="text" placeholder="🔍 Search title..." value={searchTitle}
            onChange={(e) => { setSearchTitle(e.target.value); setPage(1); }}
            style={styles.filterInput} />

          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} style={styles.filterInput}>
            <option value="All">🗂 All</option>
            <option value="Food">🍔 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Bills">📄 Bills</option>
            <option value="Other">📌 Other</option>
          </select>

          <input type="number" placeholder="Min ₹" value={minAmount}
            onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
            style={{ ...styles.filterInput, width: "90px" }} />

          <input type="number" placeholder="Max ₹" value={maxAmount}
            onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
            style={{ ...styles.filterInput, width: "90px" }} />

          <input type="date" value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            style={{ ...styles.filterInput, colorScheme: "dark" }} />

          <input type="date" value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            style={{ ...styles.filterInput, colorScheme: "dark" }} />

          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={styles.filterInput}>
            <option value="createdAt">🕐 Latest First</option>
            <option value="amount_asc">💰 Low to High</option>
            <option value="amount_desc">💰 High to Low</option>
          </select>

          <button onClick={() => {
            setSearchTitle(""); setSelectedCategory("All"); setMinAmount(""); setMaxAmount("");
            setFromDate(""); setToDate(""); setSortBy("createdAt"); setPage(1);
          }} style={styles.resetBtn}>🔄 Reset</button>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.popupIcon}>🗑️</div>
            <p style={styles.popupTitle}>Delete Expense?</p>
            <p style={styles.popupSub}>This expense will be permanently deleted.</p>
            <div style={styles.popupBtns}>
              <button style={styles.yesBtn} onClick={handleDeleteYes}>Yes, Delete</button>
              <button style={styles.noBtn} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {editExpense && (
        <div style={styles.overlay}>
          <div style={styles.editPopup}>
            <div style={styles.editHeader}>
              <h3 style={styles.editTitle}>✏️ Edit Expense</h3>
              <button style={styles.closeBtn} onClick={() => setEditExpense(null)}>✕</button>
            </div>
            <div style={styles.editBody}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
              <label style={styles.label}>Amount (₹)</label>
              <input style={styles.input} type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} />
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                <option value="Food">🍔 Food</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">📄 Bills</option>
                <option value="Other">📌 Other</option>
              </select>
              <label style={styles.label}>Date</label>
              <input style={{ ...styles.input, colorScheme: "dark" }} type="date" value={editData.date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
              <label style={styles.label}>Bill Images</label>
              {editExpense.billImage && editExpense.billImage.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {editExpense.billImage.map((img, i) => <img key={i} src={img} alt="bill" style={styles.previewImg} />)}
                  <p style={{ color: "#94a3b8", fontSize: "11px", width: "100%", margin: "4px 0 0" }}>Current images — upload new to replace</p>
                </div>
              )}
              <input key={fileKey} type="file" accept="image/*" multiple style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 5) { toast.error("Max 5 images"); return; }
                  setNewImages(files);
                }} />
              {newImages.length > 0 && <p style={{ color: "#1abc9c", fontSize: "12px", margin: "6px 0 0" }}>✅ {newImages.length} new image(s) selected</p>}
            </div>
            <div style={styles.editFooter}>
              <button style={styles.saveBtn} onClick={handleSave}>💾 Save Changes</button>
              <button style={styles.cancelBtn} onClick={() => setEditExpense(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Bill</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.empty}>
                  <div style={styles.emptyInner}>
                    <span style={{ fontSize: "36px" }}>📭</span>
                    <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>No expenses found</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((e, index) => (
                <tr key={e._id}
                  style={{ ...styles.tr, background: hoveredRow === e._id ? "#263348" : "transparent" }}
                  onMouseEnter={() => setHoveredRow(e._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.td}><span style={styles.indexBadge}>{(page - 1) * LIMIT + index + 1}</span></td>
                  <td style={styles.td}>{e.title}</td>
                  <td style={styles.td}><span style={styles.amountBadge}>₹{e.amount}</span></td>
                  <td style={styles.td}>
                    <span style={{ ...styles.categoryBadge, background: categoryColors[e.category] || "#334155" }}>
                      {categoryIcons[e.category]} {e.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.dateText}>
                      📅 {e.date ? new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {e.billImage && e.billImage.length > 0 ? (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {e.billImage.map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noreferrer">
                            <img src={img} alt="bill" style={styles.billImg} />
                          </a>
                        ))}
                      </div>
                    ) : <span style={styles.noBill}>No bill</span>}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEditClick(e)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => setDeleteConfirmId(e._id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalpages > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
          {Array.from({ length: totalpages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, background: page === p ? "#3b82f6" : "transparent", color: page === p ? "white" : "#94a3b8", borderColor: page === p ? "#3b82f6" : "#334155" }}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalpages} style={{ ...styles.pageBtn, opacity: page === totalpages ? 0.4 : 1 }}>Next →</button>
        </div>
      )}

      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "10px" }}>
        Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalCount)} of {totalCount} expenses
      </p>
    </div>
  );
};

const categoryColors = {
  Food: "#16423C", Travel: "#1a3a5c", Shopping: "#3d1f5c", Bills: "#5c3d1f", Other: "#2d3748",
};

const PIE_COLORS = {
  Food: "#22c55e",
  Travel: "#3b82f6",
  Shopping: "#a855f7",
  Bills: "#f59e0b",
  Other: "#64748b",
};
const categoryIcons = {
  Food: "🍔", Travel: "✈️", Shopping: "🛍️", Bills: "📄", Other: "📌",
};

const styles = {
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
  headerTitle: { color: "#171819", fontSize: "20px", fontWeight: "bold", margin: 0 },
  badge: { background: "#3b82f6", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  planBadge: { color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  actionBtn: { border: "1px solid", background: "transparent", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  chartCard: { background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "20px", marginBottom: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  chartTitle: { color: "white", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" },
  totalCard: { background: "#1e293b", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" },
  filterRow: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" },
  filterInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "13px" },
  resetBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #e74c3c", background: "transparent", color: "#f87171", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  tableWrapper: { overflowX: "auto", borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e293b", borderRadius: "14px", overflow: "hidden" },
  th: { padding: "14px 16px", color: "white", textAlign: "left", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", background: "#1e40af", borderBottom: "2px solid #3b82f6" },
  tr: { borderBottom: "1px solid #1e3a5f", transition: "background 0.2s" },
  td: { padding: "12px 16px", color: "white", fontSize: "14px", verticalAlign: "middle" },
  indexBadge: { background: "#334155", color: "#94a3b8", padding: "3px 9px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  amountBadge: { color: "#4ade80", fontWeight: "700", fontSize: "15px" },
  categoryBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", color: "white", whiteSpace: "nowrap" },
  dateText: { color: "#94a3b8", fontSize: "13px" },
  billImg: { width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "2px solid #334155", cursor: "pointer" },
  noBill: { color: "#475569", fontSize: "13px", fontStyle: "italic" },
  empty: { padding: "40px", textAlign: "center" },
  emptyInner: { display: "flex", flexDirection: "column", alignItems: "center" },
  editBtn: { background: "transparent", border: "1px solid #3b82f6", color: "#60a5fa", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", marginRight: "6px" },
  deleteBtn: { background: "transparent", border: "1px solid #e74c3c", color: "#f87171", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  saveBtn: { background: "#3b82f6", border: "none", color: "white", padding: "10px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", marginRight: "10px" },
  cancelBtn: { background: "#334155", border: "none", color: "white", padding: "10px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
  overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  popup: { background: "#1e293b", border: "1px solid #334155", borderRadius: "20px", padding: "40px 48px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", minWidth: "300px" },
  popupIcon: { fontSize: "48px", marginBottom: "12px" },
  popupTitle: { color: "white", fontSize: "20px", fontWeight: "bold", margin: "0 0 8px" },
  popupSub: { color: "#94a3b8", fontSize: "13px", margin: "0 0 24px" },
  popupBtns: { display: "flex", gap: "12px", justifyContent: "center" },
  yesBtn: { background: "#e74c3c", border: "none", color: "white", padding: "10px 28px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
  noBtn: { background: "#334155", border: "none", color: "white", padding: "10px 28px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
  editPopup: { background: "#1e293b", border: "1px solid #334155", borderRadius: "20px", width: "440px", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" },
  editHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #334155", background: "#1e40af" },
  editTitle: { color: "white", fontSize: "18px", fontWeight: "bold", margin: 0 },
  closeBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", fontWeight: "bold" },
  editBody: { padding: "24px", display: "flex", flexDirection: "column", gap: "4px", maxHeight: "60vh", overflowY: "auto" },
  editFooter: { padding: "16px 24px", borderTop: "1px solid #334155", display: "flex", justifyContent: "flex-end" },
  label: { color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "10px", marginBottom: "4px" },
  input: { background: "#0f172a", border: "1px solid #334155", color: "white", padding: "10px", borderRadius: "8px" },
  previewImg: { width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "2px solid #334155", cursor: "pointer" },
  pageBtn: { padding: "8px 14px", border: "1px solid #334155", borderRadius: "8px", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
};

export default ExpenseList;