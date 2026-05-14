import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("ll_user") || "null"),
  token: localStorage.getItem("ll_token") || null,
  isLoading: false,
  error: null,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/register", data);
      const { token, user } = res.data;
      localStorage.setItem("ll_token", token);
      localStorage.setItem("ll_user", JSON.stringify(user));
      set({ token, user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data;
      localStorage.setItem("ll_token", token);
      localStorage.setItem("ll_user", JSON.stringify(user));
      set({ token, user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  verifyOtp: async (otp) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/verify-otp", { otp });
      const user = { ...get().user, isVerified: true };
      localStorage.setItem("ll_user", JSON.stringify(user));
      set({ user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  resendOtp: async () => {
    try {
      await api.post("/auth/resend-otp");
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to resend OTP" };
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      localStorage.setItem("ll_user", JSON.stringify(user));
      set({ user });
    } catch {
      // silent fail
    }
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    localStorage.setItem("ll_user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("ll_token");
    localStorage.removeItem("ll_user");
    set({ user: null, token: null, error: null });
  },
}));

export default useAuthStore;
