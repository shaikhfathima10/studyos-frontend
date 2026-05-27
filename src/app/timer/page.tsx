"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "⚡", label: "Home" },
  { href: "/schedule",  icon: "📅", label: "Schedule" },
  { href: "/timer",     icon: "⏱", label: "Timer" },
  { href: "/subjects",  icon: "📚", label: "Subjects" },
  { href: "/progress",  icon: "📈", label: "Progress" },
  { href: "/rewards",   icon: "🏆", label: "Rewards" },
];

const MODES = {
  focus:  { label: "Deep Focus",   duration: 25 * 60, color: "#1E40AF", bg: "#EFF6FF" },
  short:  { label: "Short Break",  duration: 5 * 60,  color: "#059669", bg: "#D1FAE5" },
  long:   { label: "Long Break",   duration: 15 * 60, color: "#7C3AED", bg: "#EDE9FE" },
};

export default function TimerPage() {
  const [mode, setMode] = useState<keyof typeof MODES>("focus");
  const [secs, setSecs] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const intervalRef = useRef<any>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem("studyos_token") || "";
  const api = (path: string, opts?: RequestInit) =>
    fetch(`http://localhost:5000${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...opts?.headers },
    }).then(r => r.json());

  useEffect(() => {
    if (!getToken()) { router.push("/"); return; }
    api("/api/subjects").then(d => setSubjects(Array.isArray(d) ? d : []));
    api("/api/sessions/today").then(d => setTodaySessions(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { setRunning(false); setSessions(n => n + 1); clearInterval(intervalRef.current); return MODES[mode].duration; }
          return s - 1;
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m: keyof typeof MODES) => { setMode(m); setRunning(false); setSecs(MODES[m].duration); };

  const startSession = async () => {
    if (mode === "focus" && !sessionId) {
      try {
        const data = await api("/api/sessions/start", { method: "POST", body: JSON.stringify({ subjectId: selectedSubject || null, plannedMin: 25, sessionType: "focus" }) });
        setSessionId(data.id);
      } catch {}
    }
    setRunning(true);
  };

  const endSession = async () => {
  setRunning(false);
  if (sessionId) {
    try {
      const result = await api(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        body: JSON.stringify({ confidenceAfter: 65, mood: "good" }),
      });
      setSessionId(null);
      setSessions(n => n + 1);
      if (result.xp_earned) {
        alert(`Session complete! +${result.xp_earned} XP 🎉\nStreak: ${result.new_streak} days 🔥`);
      }
      const d = await api("/api/sessions/today");
      setTodaySessions(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
  }
};

  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  const pct = ((MODES[mode].duration - secs) / MODES[mode].duration) * 100;
  const color = MODES[mode].color;
  const size = 220;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1E293B" }}>⏱ Pomodoro Timer</h1>
        <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Habit-science backed focus</p>
      </div>

      <div style={{ padding: 20 }}>
        {/* Mode Selector */}
        <div style={{ display: "flex", gap: 6, background: "#F1F5F9", borderRadius: 16, padding: 6, marginBottom: 24, border: "1px solid #E2E8F0" }}>
          {(Object.entries(MODES) as any).map(([k, v]: any) => (
            <button key={k} onClick={() => switchMode(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: "none", cursor: "pointer", background: mode === k ? v.color : "transparent", color: mode === k ? "#fff" : "#64748B", fontWeight: 700, fontSize: 12, transition: "all 0.2s", boxShadow: mode === k ? `0 2px 8px ${v.color}44` : "none" }}>{v.label}</button>
          ))}
        </div>

        {/* Timer Ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <div style={{ position: "relative", background: "#fff", borderRadius: "50%", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", fontFamily: "monospace", color: "#1E293B" }}>{m}:{s}</span>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{MODES[mode].label}</span>
            </div>
          </div>

          {mode === "focus" && (
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", color: "#1E293B", fontSize: 14, outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <option value="">Select subject (optional)</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          )}

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={() => { setRunning(false); setSecs(MODES[mode].duration); setSessionId(null); }} style={{ width: 48, height: 48, borderRadius: 24, border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", cursor: "pointer", fontSize: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>↺</button>
            <button onClick={running ? endSession : startSession} style={{ width: 72, height: 72, borderRadius: 36, border: "none", background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: `0 8px 24px ${color}44` }}>
              {running ? "⏸" : "▶"}
            </button>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: MODES[mode].bg, border: `1.5px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color }}>
              {sessions}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Today:</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i < sessions ? color : "#E2E8F0", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>

        {/* Today's Sessions */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 14px", color: "#1E293B" }}>Today's Sessions</p>
          {todaySessions.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "16px 0", fontWeight: 500 }}>No sessions yet. Start your first one!</p>
          ) : todaySessions.map((sess: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: sess.ended_at ? "#059669" : "#1E40AF", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{sess.subjects?.name || "General"}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>
                  {new Date(sess.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {sess.duration_min ? ` · ${sess.duration_min}min` : " · Active"}
                </p>
              </div>
              {sess.xp_earned > 0 && <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, background: "#EDE9FE", padding: "2px 8px", borderRadius: 8 }}>+{sess.xp_earned}xp</span>}
              {sess.ended_at && <span style={{ color: "#059669", fontSize: 16 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: n.href === "/timer" ? "#EFF6FF" : "transparent" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: n.href === "/timer" ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{n.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}