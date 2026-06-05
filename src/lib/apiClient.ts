import { api } from "./api";

export const authApi = {
  register: async (data: any) => {
    const res = await api.post("/api/auth/register", data);
    if (res.session?.access_token) {
      localStorage.setItem("studyos_token", res.session.access_token);
    }
    return res;
  },
  login: async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.session?.access_token) {
      localStorage.setItem("studyos_token", res.session.access_token);
    }
    return res;
  },
  me: async () => api.get("/api/auth/me"),
  logout: () => {
    localStorage.removeItem("studyos_token");
    window.location.href = "/";
  },
};

export const subjectsApi = {
  getAll: async () => api.get("/api/subjects"),
  create: async (data: any) => api.post("/api/subjects", data),
  updateConfidence: async (id: string, confidence: number) =>
    api.patch(`/api/subjects/${id}/confidence`, { confidence }),
  delete: async (id: string) => api.delete(`/api/subjects/${id}`),
};

export const scheduleApi = {
  getByDate: async (date: string) => api.get(`/api/schedule?date=${date}`),
  generate: async (weekStart: string) => api.post("/api/schedule/generate", { weekStart }),
  updateStatus: async (id: string, status: string) =>
    api.patch(`/api/schedule/${id}/status`, { status }),
};

export const sessionsApi = {
  start: async (data: any) => api.post("/api/sessions/start", data),
  end: async (id: string, data: any) => api.post(`/api/sessions/${id}/end`, data),
  getToday: async () => api.get("/api/sessions/today"),
};

export const progressApi = {
  getReadiness: async () => api.get("/api/progress/readiness"),
  getWeeklyReport: async () => api.get("/api/progress/weekly-report"),
};

export const rewardsApi = {
  getBadges: async () => api.get("/api/rewards/badges"),
  getStreak: async () => api.get("/api/rewards/streak"),
};