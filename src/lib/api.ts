const BASE = "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("studyos_token") : null;

const req = async (path: string, opts: RequestInit = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const api = {
  get:    (path: string) => req(path),
  post:   (path: string, body: unknown) => req(path, { method: "POST", body: JSON.stringify(body) }),
  patch:  (path: string, body: unknown) => req(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => req(path, { method: "DELETE" }),
};