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

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const getToken = () => localStorage.getItem("studyos_token") || "";
  const api = (path: string, opts?: RequestInit) =>
    fetch(`http://localhost:5000${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...opts?.headers },
    }).then(r => r.json());

  const load = async (date: string) => {
    setLoading(true);
    try {
      const data = await api(`/api/schedule?date=${date}`);
      setSchedule(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!getToken()) { router.push("/"); return; }
    load(selectedDate);
  }, [selectedDate]);

  const generate = async () => {
    setGenerating(true);
    try {
      await api("/api/schedule/generate", { method: "POST", body: JSON.stringify({ weekStart: selectedDate }) });
      await load(selectedDate);
      alert("Schedule generated!");
    } catch { alert("Add subjects first!"); }
    finally { setGenerating(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await api(`/api/schedule/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load(selectedDate);
  };

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d.toISOString().split("T")[0];
  });

  const totalStudyMin = schedule.filter(b => b.block_type !== "break").reduce((s, b) => s + b.duration_min, 0);
  const doneMin = schedule.filter(b => b.status === "done").reduce((s, b) => s + b.duration_min, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1E293B" }}>📅 Schedule</h1>
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>AI-optimized daily plan</p>
          </div>
          <button onClick={generate} disabled={generating} style={{ background: "linear-gradient(135deg, #1E40AF, #4338CA)", border: "none", borderRadius: 12, padding: "10px 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
            {generating ? "⏳..." : "🤖 Generate"}
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Day selector */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
          {weekDates.map(date => {
            const d = new Date(date);
            const isSelected = date === selectedDate;
            const isToday = date === new Date().toISOString().split("T")[0];
            return (
              <button key={date} onClick={() => setSelectedDate(date)} style={{ flexShrink: 0, padding: "10px 14px", borderRadius: 14, border: `1.5px solid ${isSelected ? "#1E40AF" : "#E2E8F0"}`, background: isSelected ? "#1E40AF" : "#fff", color: isSelected ? "#fff" : "#64748B", cursor: "pointer", fontWeight: 700, fontSize: 13, textAlign: "center", boxShadow: isSelected ? "0 2px 8px rgba(30,64,175,0.3)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 10, marginBottom: 2 }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{d.getDate()}</div>
                {isToday && <div style={{ width: 4, height: 4, borderRadius: 2, background: isSelected ? "#fff" : "#1E40AF", margin: "4px auto 0" }} />}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {schedule.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Total", val: `${Math.round(totalStudyMin / 60 * 10) / 10}h`, color: "#1E40AF", bg: "#EFF6FF" },
              { label: "Done", val: `${Math.round(doneMin / 60 * 10) / 10}h`, color: "#059669", bg: "#D1FAE5" },
              { label: "Left", val: `${Math.round((totalStudyMin - doneMin) / 60 * 10) / 10}h`, color: "#D97706", bg: "#FEF3C7" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 12, padding: "12px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: s.color }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 10, color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <p style={{ color: "#94A3B8", textAlign: "center", padding: "40px 0", fontWeight: 500 }}>Loading...</p>
        ) : schedule.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 48 }}>📅</p>
            <p style={{ color: "#64748B", fontSize: 15, marginTop: 12, fontWeight: 600 }}>No schedule for this day.</p>
            <p style={{ color: "#94A3B8", fontSize: 13 }}>Click Generate to create one!</p>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: 1, background: "#E2E8F0" }} />
            {schedule.map((block: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, color: "#94A3B8", minWidth: 44, paddingTop: 14, fontFamily: "monospace", fontWeight: 600 }}>{block.start_time?.slice(0, 5)}</span>
                <div style={{ position: "relative", paddingTop: 12, marginRight: 8, zIndex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: block.status === "done" ? "#059669" : block.status === "active" ? "#1E40AF" : block.block_type === "break" ? "#E2E8F0" : block.subjects?.color || "#1E40AF", boxShadow: block.status === "active" ? "0 0 10px #1E40AF" : "none" }} />
                </div>
                <div onClick={() => block.block_type !== "break" && updateStatus(block.id, block.status === "done" ? "pending" : "done")} style={{ flex: 1, borderRadius: 12, padding: "12px 14px", background: block.status === "done" ? "#F8FAFC" : "#fff", border: `1px solid ${block.status === "active" ? "#1E40AF44" : "#E2E8F0"}`, opacity: block.status === "done" ? 0.6 : 1, cursor: block.block_type !== "break" ? "pointer" : "default", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1E293B" }}>{block.subjects?.name || block.block_type}</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>{block.duration_min}m</span>
                      {block.status === "done" && <span style={{ color: "#059669", fontSize: 16 }}>✓</span>}
                    </div>
                  </div>
                  {block.block_type !== "break" && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8", textTransform: "capitalize" }}>{block.block_type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: n.href === "/schedule" ? "#EFF6FF" : "transparent" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: n.href === "/schedule" ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{n.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}