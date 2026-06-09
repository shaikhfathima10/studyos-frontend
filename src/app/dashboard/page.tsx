"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Calendar, Clock, BookOpen, TrendingUp, Trophy, Flame, Star, Target } from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: Home,        label: "Home" },
  { href: "/schedule",  icon: Calendar,    label: "Schedule" },
  { href: "/timer",     icon: Clock,       label: "Timer" },
  { href: "/subjects",  icon: BookOpen,    label: "Subjects" },
  { href: "/progress",  icon: TrendingUp,  label: "Progress" },
  { href: "/rewards",   icon: Trophy,      label: "Rewards" },
];

const STATS = [
  { Icon: Flame,  key: "streak", label: "Streak", color: "#D97706" },
  { Icon: Star,   key: "xp",     label: "XP",     color: "#7C3AED" },
  { Icon: Target, key: "level",  label: "Level",  color: "#1E40AF" },
];

export default function Dashboard() {
  const [user, setUser]         = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [schedule, setSchedule]  = useState<any[]>([]);
  const [loading, setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const tok  = () => localStorage.getItem("studyos_token") || "";

  const apiFetch = async (path: string, opts?: RequestInit) => {
    const res = await fetch(BASE + path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tok(),
        ...(opts?.headers || {}),
      },
    });
    return res.json();
  };

  const loadSchedule = async () => {
    const today = new Date().toISOString().split("T")[0];
    const sched = await apiFetch("/api/schedule?date=" + today);
    setSchedule(Array.isArray(sched) ? sched : []);
  };

  useEffect(() => {
    if (!localStorage.getItem("studyos_token")) { router.push("/"); return; }
    (async () => {
      try {
        const [me, r] = await Promise.all([
          apiFetch("/api/auth/me"),
          apiFetch("/api/progress/readiness"),
        ]);
        setUser(me);
        setReadiness(r);
        await loadSchedule();
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const generateSchedule = async () => {
    setGenerating(true);
    try {
      const weekStart = new Date().toISOString().split("T")[0];
      await apiFetch("/api/schedule/generate", {
        method: "POST",
        body: JSON.stringify({ weekStart }),
      });
      await loadSchedule();
      alert("Schedule generated!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setGenerating(false); }
  };

  const logout = () => {
    localStorage.removeItem("studyos_token");
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <BookOpen size={48} color="#1E40AF" />
        <p style={{ color: "#64748B", marginTop: 12, fontWeight: 600 }}>Loading StudyOS...</p>
      </div>
    </div>
  );

  const examDays = user?.exam_date
    ? Math.ceil((new Date(user.exam_date).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1E40AF, #4338CA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#1E293B" }}>Study<span style={{ color: "#1E40AF" }}>OS</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 20, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center" }}>
            <Flame size={14} color="#D97706" />
            <span style={{ fontWeight: 800, color: "#D97706", fontSize: 13 }}>{user?.streak || 0}</span>
          </div>
          <button onClick={logout} style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: "6px 12px", color: "#DC2626", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: 20 }}>

        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#1E293B" }}>
            Hey, {user?.name?.split(" ")[0] || "Scholar"}!
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            {examDays ? `Exam in ${examDays} days · Let's crush it!` : "Welcome to StudyOS!"}
          </p>
        </div>

        {/* Readiness */}
        {readiness && (
          <div style={{ borderRadius: 20, padding: 24, background: "linear-gradient(135deg, #1E40AF, #4338CA)", marginBottom: 16, color: "#fff" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Exam Readiness</p>
            <p style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, margin: 0, letterSpacing: "-2px" }}>
              {readiness.readiness}<span style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>%</span>
            </p>
            <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: readiness.readiness + "%", borderRadius: 3, background: "#fff" }} />
            </div>
            {readiness.critical_subjects?.length > 0 && (
              <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                Critical: {readiness.critical_subjects.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {STATS.map(({ Icon, key, label, color }) => (
            <div key={key} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <Icon size={22} color={color} />
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4, color }}>{user?.[key] || (key === "level" ? 1 : 0)}</div>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "#1E293B" }}>Today's Schedule</p>
            <button onClick={generateSchedule} disabled={generating} style={{ background: "linear-gradient(135deg, #1E40AF, #4338CA)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              {generating ? "..." : "Generate"}
            </button>
          </div>
          {schedule.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Calendar size={40} color="#CBD5E1" />
              <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 10, fontWeight: 500 }}>No schedule yet. Click Generate!</p>
            </div>
          ) : schedule.slice(0, 8).map((block: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 10, background: i % 2 === 0 ? "#F8FAFC" : "#fff", marginBottom: 4, border: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 40, fontFamily: "monospace", fontWeight: 600 }}>
                {block.start_time?.slice(0, 5)}
              </span>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: block.subjects?.color || "#1E40AF", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: "#1E293B" }}>
                {block.subjects?.name || "Break"}
              </span>
              <span style={{ fontSize: 11, color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>{block.duration_min}m</span>
              {block.status === "done" && <span style={{ color: "#10B981" }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = href === "/dashboard";
            return (
              <a key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: active ? "#EFF6FF" : "transparent" }}>
                <Icon size={22} color={active ? "#1E40AF" : "#94A3B8"} />
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}