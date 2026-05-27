"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", name: "",
    examDate: "", dailyHours: 4, goal: "Score 90%+"
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("studyos_token");
    if (token) router.push("/dashboard");
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.session?.access_token) localStorage.setItem("studyos_token", data.session.access_token);
      if (data.session?.refresh_token) localStorage.setItem("studyos_refresh", data.session.refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 12,
    border: "1.5px solid #E2E8F0",
    background: "#F8FAFC",
    color: "#1E293B",
    fontSize: 15,
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
    display: "block",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #EFF6FF 0%, #F0F4FF 50%, #EEF2FF 100%)",
    }}>
      {/* Left side */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1E40AF, #4338CA, #7C3AED)",
        padding: 48, color: "#fff",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, marginBottom: 24,
          border: "1px solid rgba(255,255,255,0.3)",
        }}>📖</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, letterSpacing: "-1.5px" }}>StudyOS</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
          AI-powered study planner<br/>that helps you ace your exams
        </p>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 280 }}>
          {[
            { icon: "🤖", text: "AI schedule generation" },
            { icon: "📊", text: "Exam readiness tracking" },
            { icon: "⏱", text: "Pomodoro timer" },
            { icon: "🏆", text: "Streaks & rewards" },
          ].map(f => (
            <div key={f.text} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0
              }}>{f.icon}</div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 48,
        background: "#fff",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1E293B", margin: "0 0 8px" }}>
            {mode === "login" ? "Welcome back! 👋" : "Get started free 🚀"}
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 32 }}>
            {mode === "login" ? "Sign in to continue your study journey" : "Create your account to start studying smarter"}
          </p>

          {/* Tabs */}
          <div style={{
            display: "flex", background: "#F1F5F9",
            borderRadius: 12, padding: 4, marginBottom: 28,
            border: "1px solid #E2E8F0"
          }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px", borderRadius: 9, border: "none",
                cursor: "pointer",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#1E40AF" : "#94A3B8",
                fontWeight: 700, fontSize: 14,
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
              }}>{m === "login" ? "Sign In" : "Register"}</button>
            ))}
          </div>

          <form onSubmit={handle}>
            {mode === "register" && (
              <>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Full Name</label>
                <input style={inp} placeholder="Enter your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </>
            )}

            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Email</label>
            <input style={inp} type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />

            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Password</label>
            <input style={inp} type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

            {mode === "register" && (
              <>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Exam Date</label>
                <input style={inp} type="date"
                  value={form.examDate}
                  onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} required />

                <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Goal</label>
                <select style={inp} value={form.goal}
                  onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}>
                  {["Score 90%+", "Pass with merit", "Just pass", "Get top rank"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>
                    Daily study hours: <span style={{ color: "#1E40AF" }}>{form.dailyHours}h</span>
                  </label>
                  <input type="range" min={1} max={12} value={form.dailyHours}
                    onChange={e => setForm(f => ({ ...f, dailyHours: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "#1E40AF" }} />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px", borderRadius: 12, border: "none",
              background: loading ? "#94A3B8" : "linear-gradient(135deg, #1E40AF, #4338CA)",
              color: "#fff", fontSize: 16, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(30,64,175,0.4)",
              marginTop: 8,
            }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, marginTop: 20 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ color: "#1E40AF", cursor: "pointer", fontWeight: 700 }}>
              {mode === "login" ? "Register free" : "Sign in"}
            </span>
          </p>

          <p style={{ textAlign: "center", color: "#CBD5E1", fontSize: 11, marginTop: 32 }}>
            🔒 Secured by Supabase · AI by Claude + OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}