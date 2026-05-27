import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyOS",
  description: "AI-powered study planner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#F8FAFC", color: "#1E293B", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
