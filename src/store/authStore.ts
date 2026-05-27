import { create } from "zustand";
import { authApi } from "@/lib/apiClient";

interface Profile {
  id: string;
  name: string;
  goal: string;
  exam_date: string;
  daily_hours: number;
  xp: number;
  level: number;
  streak: number;
}

interface AuthStore {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await authApi.login(email, password);
      set({ user: data.user.profile, isAuthenticated: true });
    } finally {
      set({ loading: false });
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const data = await authApi.register(formData as any);
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem("studyos_token");
    if (!token) return;
    try {
      const data = await authApi.me();
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem("studyos_token");
    }
  },

  logout: () => {
    localStorage.removeItem("studyos_token");
    set({ user: null, isAuthenticated: false });
    window.location.href = "/";
  },
}));
