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

export default function RewardsPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = () => localStorage.getItem("studyos_token") || "";
  const api = (path: string) =>
    fetch(`http://localhost:5000${path}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json());

  useEffect(() => {
    if (!getToken()) { router.push("/"); return; }
    const load = async () => {
      try {
        const [b, s] = await Promise.all([api("/api/rewards/badges"), api("/api/rewards/streak")]);
        setBadges(Array.isArray(b) ? b : []);
        setStreak(s);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const card: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <p style={{ color: "#64748B", fontWeight: 600 }}>Loading rewards...</p>
    </div>
  );

  const xp = streak?.xp || 0;
  const level = streak?.level || 1;
  const nextLevelXp = level * 500;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1E293B" }}>🏆 Rewards</h1>
        <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Streaks, XP & Badges</p>
      </div>

      <div style={{ padding: 20 }}>
        {/* XP Card */}
        <div style={{ borderRadius: 24, padding: 24, background: "linear-gradient(135deg, #1E40AF, #4338CA, #7C3AED)", marginBottom: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Level {level} · Scholar</p>
              <p style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1 }}>{xp.toLocaleString()} XP</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 44 }}>🔥</span>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700 }}>{streak?.streak || 0} days</p>
            </div>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((xp / nextLevelXp) * 100, 100)}%`, borderRadius: 4, background: "rgba(255,255,255,0.9)" }} />
          </div>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{nextLevelXp - xp} XP to Level {level + 1}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { icon: "🔥", label: "Current Streak", val: `${streak?.streak || 0} days`, color: "#D97706", bg: "#FEF3C7" },
            { icon: "💎", label: "Longest Streak", val: `${streak?.longest_streak || 0} days`, color: "#7C3AED", bg: "#EDE9FE" },
          ].map(s => (
            <div key={s.label} style={{ ...card, background: s.bg, border: `1px solid ${s.color}22`, marginBottom: 0 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={card}>
          <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 16px", color: "#1E293B" }}>Badges</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {badges.map((b: any) => (
              <div key={b.id} style={{ padding: "16px 14px", borderRadius: 14, background: b.earned ? "#EFF6FF" : "#F8FAFC", border: `1px solid ${b.earned ? "#BFDBFE" : "#E2E8F0"}`, opacity: b.earned ? 1 : 0.5, filter: b.earned ? "none" : "grayscale(1)" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>{b.icon}</span>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#1E293B" }}>{b.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>{b.description}</p>
                {b.earned && <span style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", marginTop: 6, display: "block" }}>✓ Earned</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Group Study */}
        <div style={{ ...card, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>👥</span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#1E293B" }}>Group Study Mode</p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>Study together · earn bonus XP</p>
            </div>
          </div>
          <button style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #4338CA)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
            🔗 Create Study Room
          </button>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: n.href === "/rewards" ? "#EFF6FF" : "transparent" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: n.href === "/rewards" ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{n.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}