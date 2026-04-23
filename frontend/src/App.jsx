import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── API HELPER ───────────────────────────────────────────────────────────────
const api = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// ─── CATEGORY COLORS ──────────────────────────────────────────────────────────
const catColors = {
  Academic: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  Hostel: { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  Transport: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Other: { bg: "#fef3c7", text: "#78350f", dot: "#f59e0b" },
};

const statusColors = {
  Pending: { bg: "#fef9c3", text: "#713f12" },
  Resolved: { bg: "#dcfce7", text: "#14532d" },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 12, fontWeight: 600,
      background: type === "error" ? "#fee2e2" : "#dcfce7",
      color: type === "error" ? "#991b1b" : "#14532d",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      animation: "slideIn 0.3s ease",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 14 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
          transition: "border 0.2s", background: "#f9fafb", boxSizing: "border-box"
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 14 }}>{label}</label>
      <select value={value} onChange={onChange}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
          background: "#f9fafb", boxSizing: "border-box", cursor: "pointer"
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", type = "button", disabled, small }) {
  const styles = {
    primary: { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    ghost: { background: "#f3f4f6", color: "#374151" },
    success: { background: "#d1fae5", color: "#065f46" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: small ? "6px 14px" : "10px 20px",
      borderRadius: 10, border: "none", fontWeight: 600,
      fontSize: small ? 13 : 14, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1, transition: "opacity 0.2s, transform 0.1s",
    }}
      onMouseEnter={e => { if (!disabled) e.target.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.target.style.opacity = "1"; }}
    >{children}</button>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
function RegisterPage({ onSwitch, onToast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/register", { method: "POST", body: JSON.stringify(form) });
      onToast("Registered! Please log in.", "success");
      onSwitch();
    } catch (err) {
      onToast(err.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join the Grievance Portal">
      <form onSubmit={handle}>
        <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@college.edu" required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
        <Btn type="submit" disabled={loading}>{loading ? "Registering…" : "Register"}</Btn>
      </form>
      <p style={{ marginTop: 20, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        Already registered?{" "}
        <span onClick={onSwitch} style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>Login →</span>
      </p>
    </AuthCard>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onSwitch, onToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/login", { method: "POST", body: JSON.stringify(form) });
      onLogin(data.token, data.name);
      onToast(`Welcome back, ${data.name}!`, "success");
    } catch (err) {
      onToast(err.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Log in to your portal">
      <form onSubmit={handle}>
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@college.edu" required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" required />
        <Btn type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</Btn>
      </form>
      <p style={{ marginTop: 20, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        New student?{" "}
        <span onClick={onSwitch} style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>Register here →</span>
      </p>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#eef2ff 0%,#f5f3ff 50%,#fce7f3 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "40px 36px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(99,102,241,0.12)"
      }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e1b4b" }}>{title}</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ token, name, onLogout, onToast }) {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [view, setView] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/grievances", {}, token);
      setGrievances(data);
    } catch (err) { onToast(err.message, "error"); }
    finally { setLoading(false); }
  }, [token, onToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q) return fetchAll();
    try {
      const data = await api(`/api/grievances/search?title=${encodeURIComponent(q)}`, {}, token);
      setGrievances(data);
    } catch (err) { onToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grievance?")) return;
    try {
      await api(`/api/grievances/${id}`, { method: "DELETE" }, token);
      onToast("Deleted successfully", "success");
      fetchAll();
    } catch (err) { onToast(err.message, "error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* NAVBAR */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "0 24px", height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1e1b4b" }}>GrievancePortal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#6b7280", fontSize: 14 }}>👋 {name}</span>
          <Btn variant="ghost" small onClick={onLogout}>Logout</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* HEADER ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e1b4b" }}>My Grievances</h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>{grievances.length} total</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              placeholder="🔍 Search by title…"
              value={search}
              onChange={handleSearch}
              style={{
                padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                fontSize: 14, outline: "none", width: 220, background: "#fff"
              }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
            <Btn onClick={() => { setShowForm(true); setEditItem(null); }}>+ New Grievance</Btn>
          </div>
        </div>

        {/* MODAL FORM */}
        {showForm && (
          <GrievanceForm
            token={token}
            editItem={editItem}
            onSave={() => { setShowForm(false); fetchAll(); onToast(editItem ? "Updated!" : "Submitted!", "success"); }}
            onClose={() => { setShowForm(false); setEditItem(null); }}
            onToast={onToast}
          />
        )}

        {/* GRIEVANCE DETAIL VIEW */}
        {view && (
          <GrievanceDetail item={view} onClose={() => setView(null)} />
        )}

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading…</div>
        ) : grievances.length === 0 ? (
          <EmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {grievances.map(g => (
              <GrievanceCard
                key={g._id}
                item={g}
                onEdit={() => { setEditItem(g); setShowForm(true); }}
                onDelete={() => handleDelete(g._id)}
                onView={() => setView(g)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GrievanceCard({ item, onEdit, onDelete, onView }) {
  const cat = catColors[item.category] || catColors.Other;
  const stat = statusColors[item.status] || statusColors.Pending;
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
      transition: "box-shadow 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>{item.title}</h3>
            <span style={{ background: cat.bg, color: cat.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.dot, display: "inline-block" }} />
              {item.category}
            </span>
            <span style={{ background: stat.bg, color: stat.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
              {item.status}
            </span>
          </div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14, lineHeight: 1.5, maxWidth: 550 }}>
            {item.description.length > 100 ? item.description.slice(0, 100) + "…" : item.description}
          </p>
          <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: 12 }}>
            {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small variant="ghost" onClick={onView}>View</Btn>
          <Btn small variant="success" onClick={onEdit}>Edit</Btn>
          <Btn small variant="danger" onClick={onDelete}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

function GrievanceForm({ token, editItem, onSave, onClose, onToast }) {
  const [form, setForm] = useState({
    title: editItem?.title || "",
    description: editItem?.description || "",
    category: editItem?.category || "Academic",
    status: editItem?.status || "Pending",
  });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api(`/api/grievances/${editItem._id}`, { method: "PUT", body: JSON.stringify(form) }, token);
      } else {
        await api("/api/grievances", { method: "POST", body: JSON.stringify(form) }, token);
      }
      onSave();
    } catch (err) { onToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 28px",
        width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.18)"
      }}>
        <h3 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>
          {editItem ? "✏️ Edit Grievance" : "📝 Submit Grievance"}
        </h3>
        <form onSubmit={handle}>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title of your complaint" required />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 14 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your grievance in detail…" required rows={4}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                resize: "vertical", fontFamily: "inherit", background: "#f9fafb", boxSizing: "border-box"
              }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={["Academic", "Hostel", "Transport", "Other"]} />
          {editItem && (
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={["Pending", "Resolved"]} />
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn type="submit" disabled={loading}>{loading ? "Saving…" : editItem ? "Update" : "Submit"}</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function GrievanceDetail({ item, onClose }) {
  const cat = catColors[item.category] || catColors.Other;
  const stat = statusColors[item.status] || statusColors.Pending;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{item.title}</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ background: cat.bg, color: cat.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{item.category}</span>
          <span style={{ background: stat.bg, color: stat.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{item.status}</span>
        </div>
        <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>{item.description}</p>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>Submitted: {new Date(item.date).toLocaleString("en-IN")}</p>
        <p style={{ color: "#9ca3af", fontSize: 12, wordBreak: "break-all" }}>ID: {item._id}</p>
        <div style={{ marginTop: 20 }}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>No grievances found</p>
      <p style={{ fontSize: 14, marginBottom: 20 }}>Submit your first complaint below</p>
      <Btn onClick={onNew}>+ Submit Grievance</Btn>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(() => localStorage.getItem("grv_token") || null);
  const [name, setName] = useState(() => localStorage.getItem("grv_name") || "");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const handleLogin = (t, n) => {
    localStorage.setItem("grv_token", t);
    localStorage.setItem("grv_name", n);
    setToken(t); setName(n);
  };

  const handleLogout = () => {
    localStorage.removeItem("grv_token");
    localStorage.removeItem("grv_name");
    setToken(null); setName("");
    setPage("login");
    showToast("Logged out successfully", "success");
  };

  return (
    <>
      <style>{`* { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; } body { margin: 0; } @keyframes slideIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }`}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {token ? (
        <Dashboard token={token} name={name} onLogout={handleLogout} onToast={showToast} />
      ) : page === "login" ? (
        <LoginPage onLogin={handleLogin} onSwitch={() => setPage("register")} onToast={showToast} />
      ) : (
        <RegisterPage onSwitch={() => setPage("login")} onToast={showToast} />
      )}
    </>
  );
}
