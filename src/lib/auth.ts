export const apiCall = async (path: string, opts?: RequestInit) => {
  let token = localStorage.getItem("studyos_token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...opts?.headers,
    },
  });

  // Auto refresh if expired
  if (res.status === 401) {
    const refresh = localStorage.getItem("studyos_refresh");
    if (refresh) {
      const r = await fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      const d = await r.json();
      if (d.access_token) {
        localStorage.setItem("studyos_token", d.access_token);
        // Retry original request
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`, {
          ...opts,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${d.access_token}`,
            ...opts?.headers,
          },
        }).then(r => r.json());
      }
    }
    localStorage.removeItem("studyos_token");
    window.location.href = "/";
    throw new Error("Session expired");
  }

  return res.json();
};