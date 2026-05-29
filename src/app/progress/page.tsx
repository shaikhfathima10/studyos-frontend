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

export default function ProgressPage() {
  const [readiness, setReadiness] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const router = useRouter();

  const getToken = () => localStorage.getItem("studyos_token") || "";
  const api = (path: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json());

  useEffect(() => {
    if (!getToken()) { router.push("/"); return; }
    const load = async () => {
      try {
        const [r, s] = await Promise.all([api("/api/progress/readiness"), api("/api/subjects")]);
        setReadiness(r);
        setSubjects(Array.isArray(s) ? s : []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const getReport = async () => {
    setLoadingReport(true);
    try {
      const r = await api("/api/progress/weekly-report");
      setReport(r);
    } catch { alert("Failed to generate report"); }
    finally { setLoadingReport(false); }
  };

  const card: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <p style={{ color: "#64748B", fontWeight: 600 }}>Analyzing your progress...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1E293B" }}>📈 Progress</h1>
        <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>AI-powered analysis</p>
      </div>

      <div style={{ padding: 20 }}>
        {readiness && (
          <div style={{ borderRadius: 20, padding: 24, background: "linear-gradient(135deg, #1E40AF, #4338CA)", marginBottom: 16, color: "#fff" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Exam Readiness</p>
            <p style={{ fontSize: 56, fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: "-2px" }}>
              {readiness.readiness}<span style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>%</span>
            </p>
            <div style={{ marginTop: 12, height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${readiness.readiness}%`, borderRadius: 4, background: "#fff" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
              {[
                { label: "Confidence", val: `${readiness.breakdown?.confidence_score}%` },
                { label: "Pace", val: `${readiness.breakdown?.pace_score}%` },
                { label: "Time", val: `${readiness.breakdown?.time_buffer_score}%` },
              ].map(b => (
                <div key={b.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: 10 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{b.val}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{b.label}</p>
                </div>
              ))}
            </div>
            {readiness.critical_subjects?.length > 0 && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <p style={{ margin: 0, color: "#FCA5A5", fontSize: 12, fontWeight: 700 }}>⚠️ Critical: {readiness.critical_subjects.join(", ")}</p>
              </div>
            )}
          </div>
        )}

        {subjects.length > 0 && (
          <div style={card}>
            <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 16px", color: "#1E293B" }}>Subject Performance</p>
            {subjects.map((s: any) => (
              <div key={s.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 16 }}>{s.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{s.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{s.studied_hours}h/{s.target_hours}h</span>
                    <span style={{ fontWeight: 800, color: s.color, fontSize: 14, fontFamily: "monospace" }}>{s.confidence}%</span>
                  </div>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.confidence}%`, borderRadius: 3, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: report ? 16 : 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "#1E293B" }}>🤖 AI Weekly Report</p>
            <button onClick={getReport} disabled={loadingReport} style={{ background: "linear-gradient(135deg, #1E40AF, #4338CA)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
              {loadingReport ? "Generating..." : "Generate"}
            </button>
          </div>
          {report ? (
            <div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "#EFF6FF", marginBottom: 14, border: "1px solid #BFDBFE" }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1E293B" }}>{report.headline}</p>
                <p style={{ margin: "8px 0 0", color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>{report.summary}</p>
              </div>
              {report.wins?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "#059669", fontSize: 13, margin: "0 0 6px" }}>🎉 Wins</p>
                  {report.wins.map((w: string, i: number) => <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: "#1E293B" }}>• {w}</p>)}
                </div>
              )}
              {report.concerns?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "#DC2626", fontSize: 13, margin: "0 0 6px" }}>⚠️ Concerns</p>
                  {report.concerns.map((c: string, i: number) => <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: "#1E293B" }}>• {c}</p>)}
                </div>
              )}
              {report.next_week_actions?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "#D97706", fontSize: 13, margin: "0 0 6px" }}>📋 Next Week</p>
                  {report.next_week_actions.map((a: string, i: number) => <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: "#1E293B" }}>• {a}</p>)}
                </div>
              )}
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#065F46", fontStyle: "italic" }}>"{report.motivational_message}"</p>
              </div>
            </div>
          ) : (
            <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "20px 0", margin: 0, fontWeight: 500 }}>Click Generate to get your AI weekly analysis!</p>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E2E8F0", padding: "8px 8px 16px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex" }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 12, textDecoration: "none", background: n.href === "/progress" ? "#EFF6FF" : "transparent" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: n.href === "/progress" ? "#1E40AF" : "#94A3B8", textTransform: "uppercase" }}>{n.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}