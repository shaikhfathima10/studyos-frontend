const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem("studyos_token");

export const apiCall = async (path: string, opts?: RequestInit): Promise<any> => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers || {}),
    },
  });
  return res.json();
};