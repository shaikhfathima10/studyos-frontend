"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "⚡", label: "Home" },
  { href: "/schedule",  icon: "📅", label: "Schedule" },
  { href: "/timer",     icon: "⏱", label: "Timer" },
  { href: "/subjects",  icon: "📚", label: "Subjects" },
  { href: "/progress",  icon: "📈", label: "Progress" },
  { href: "/rewards",   icon: "🏆", label: "Rewards" },
];

const COLORS = ["#1E40AF","#7C3AED","#DC2626","#D97706","#059669","#0891B2"];
const EMOJIS = ["📚","⚛️","🧪","📐","🏛️","📖","💻","🌍","🎵","🏃"];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: "", emoji: "📚", color: "#1E40AF", targetHours: 20, topics: "" });
  const router = useRouter();

  const getToken = () => localStorage.getItem("studyos_token") || "";
  const api = (path: string, opts?: RequestInit) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...opts?.headers },
    }).then(r => r.json());

  const load = async () => {
    if (!getToken()) { router.push("/"); return; }
    try {
      const data = await api("/api/subjects");
      setSubjects(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ ...form, topics: form.topics.split(",").map(t => t.trim()).filter(Boolean) }),
      });
      setShowAdd(false);
      setForm({ name: "", emoji: "📚", color: "#1E40AF", targetHours: 20, topics: "" });
      load();
    } catch { alert("Failed to add subject"); }
  };

  const updateConfidence = async (id: string, confidence: number) => {
    await api(`/api/subjects/${id}/confidence`, { method: "PATCH", body: JSON.stringify({ confidence }) });
    load();
  };

  const deleteSubject = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    await api(`/api/subjects/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  };

  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #E2E8F0",
    borderRadius: 16, padding: 20, marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
      <p style={{ color: "#64748B", fontWeight: 600 }}>Loading subjects...</p>
    </div>
  );

  if (selected) {
    const sub = subjects.find(s => s.id === selected);
    if (!sub) { setSelected(null); return null; }
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setSelected(null)} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "10px 16px", color: "#1E293B", cursor: "pointer", marginBottom: 20, fontSize: 14, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>← Back</button>

        <div style={{ ...card, borderTop: `4px solid ${sub.color}` }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${sub.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{sub.emoji}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1E293B" }}>{sub.name}</h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: `${sub.color}15`, color: sub.color, textTransform: "uppercase" }}>{sub.priority}</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>Confidence</span>
              <span style={{ fontWeight: 800, color: sub.color, fontSize: 18 }}>{sub.confidence}%</span>
            </div>
            <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${sub.confidence}%`, borderRadius: 4, background: sub.color }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[{ label: "😰 Low", val: 25, color: "#DC2626", bg: "#FEE2E2" },
              { label: "😐 Okay", val: 55, color: "#D97706", bg: "#FEF3C7" },
              { label: "😊 Good", val: 80, color: "#059669", bg: "#D1FAE5" }].map(b => (
              <button key={b.val} onClick={() => updateConfidence(sub.id, b.val)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${b.color}33`, background: b.bg, color: b.color, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{b.label}</button>
            ))}
          </div>
        </div>

        {sub.topics?.length > 0 && (
          <div style={card}>
            <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 14px", color: "#1E293B" }}>Topics</p>
            {sub.topics.map((t: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{t.name}</span>
              </div>
            ))}
          </div>
        )}

        <div style={card}>
          <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 12px", color: "#1E293B" }}>Study Progress</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#64748B", fontSize: 13 }}>Hours studied</span>
            <span style={{ fontWeight: 700, color: "#1E293B" }}>{sub.studied_hours}h / {sub.target_hours}h</span>
          </div>
          <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((sub.studied_hours / sub.target_hours) * 100, 100)}%`, borderRadius: 4, background: sub.color }} />
          </div>
        </div>

        <button onClick={() => deleteSubject(sub.id)} style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #FECACA", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          🗑 Delete Subject
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1E293B" }}>📚 Subjects</h1>
          <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Confidence tracked by AI</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg, #1E40AF, #4338CA)", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>+ Add</button>
      </div>

      <div style={{ padding: 20 }}>
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 900, color: "#1E293B" }}>Add Subject</h3>
              <form onSubmit={addSubject}>
                <input placeholder="Subject name (e.g. Physics)" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#1E293B", fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 8px", fontWeight: 600 }}>Pick emoji:</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {EMOJIS.map(em => (
                      <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.emoji === em ? "#1E40AF" : "#E2E8F0"}`, background: form.emoji === em ? "#EFF6FF" : "#F8FAFC", cursor: "pointer", fontSize: 20 }}>{em}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 8px", fontWeight: 600 }}>Pick color:</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 32, height: 32, borderRadius: 16, border: `3px solid ${form.color === c ? "#1E293B" : "transparent"}`, background: c, cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
                <input placeholder="Topics (comma separated)" value={form.topics}
                  onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#1E293B", fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
                  <button type="submit" style={{ flex: 2, padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #4338CA)", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 15, boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>Add Subject</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {subjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 48 }}>📚</p>
            <p style={{ color: "#64748B", fontSize: 15, marginTop: 12, fontWeight: 600 }}>No subjects yet.</p>
            <p style={{ color: "#94A3B8", fontSize: 13 }}>Click + Add to get started!</p>
          </div>
        ) : subjects.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)} style={{ width: "100%", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, cursor: "pointer", textAlign: "left", marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: `${s.color}15`, color: s.color, textTransform: "uppercase" }}>{s.priority}</span>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${s.confidence}%`, borderRadius: 3, background: s.color }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{s.studied_hours}h / {s.target_hours}h</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.confidence}%</span>
                </div>
              </div>
              <span style={{ color: "#CBD5E1", fontSize: 18 }}>›</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: n.href === "/subjects" ? "#EFF6FF" : "transparent" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: n.href === "/subjects" ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{n.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}