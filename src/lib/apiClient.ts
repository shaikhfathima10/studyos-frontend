import { api } from "./api";

export const authApi = {
  register: async (data: {
    email: string; password: string; name: string;
    examDate: string; dailyHours: number; goal?: string;
  }) => {
    const res = await api.post("/api/auth/register", data);
    if (res.data.session?.access_token) {
      localStorage.setItem("studyos_token", res.data.session.access_token);
    }
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.data.session?.access_token) {
      localStorage.setItem("studyos_token", res.data.session.access_token);
    }
    return res.data;
  },

  me: async () => {
    const res = await api.get("/api/auth/me");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("studyos_token");
    window.location.href = "/";
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.patch("/api/auth/profile", data);
    return res.data;
  },
};

export const subjectsApi = {
  getAll: async () => (await api.get("/api/subjects")).data,
  create: async (data: Record<string, unknown>) => (await api.post("/api/subjects", data)).data,
  updateConfidence: async (id: string, confidence: number) =>
    (await api.patch(`/api/subjects/${id}/confidence`, { confidence })).data,
  delete: async (id: string) => (await api.delete(`/api/subjects/${id}`)).data,
};

export const scheduleApi = {
  getByDate: async (date: string) => (await api.get(`/api/schedule?date=${date}`)).data,
  generate: async (weekStart: string) => (await api.post("/api/schedule/generate", { weekStart })).data,
  updateStatus: async (id: string, status: string) =>
    (await api.patch(`/api/schedule/${id}/status`, { status })).data,
};

export const sessionsApi = {
  start: async (data: Record<string, unknown>) => (await api.post("/api/sessions/start", data)).data,
  end: async (id: string, data: Record<string, unknown>) =>
    (await api.post(`/api/sessions/${id}/end`, data)).data,
  getToday: async () => (await api.get("/api/sessions/today")).data,
};

export const progressApi = {
  getReadiness: async () => (await api.get("/api/progress/readiness")).data,
  getWeeklyReport: async () => (await api.get("/api/progress/weekly-report")).data,
  getHistory: async () => (await api.get("/api/progress/history")).data,
};

export const rewardsApi = {
  getBadges: async () => (await api.get("/api/rewards/badges")).data,
  getStreak: async () => (await api.get("/api/rewards/streak")).data,
};
