/**
 * Axios API client – automatically attaches the JWT access token.
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = res.data;
          localStorage.setItem("access_token", access_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Typed API helpers ──────────────────────────────────────────────────────

export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  update: (data: any) => api.patch("/auth/me", data),
  changePassword: (data: any) => api.post("/auth/change-password", data),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
  verify: (token: string) => api.get(`/auth/verify?token=${token}`),
};

export const tendersApi = {
  list: (params?: any) => api.get("/tenders", { params }),
  get: (id: string) => api.get(`/tenders/${id}`),
  recent: (limit = 5) => api.get("/tenders/recent", { params: { limit } }),
  highValue: (limit = 6) =>
    api.get("/tenders/high-value", { params: { limit } }),
  stats: () => api.get("/tenders/stats/summary"),
  downloadWord: (id: string) =>
    api.get(`/tenders/${id}/download/word`, { responseType: "blob" }),
  downloadPdf: (id: string) =>
    api.get(`/tenders/${id}/download/pdf`, { responseType: "blob" }),
};

export const alertsApi = {
  sectors: () => api.get("/alerts/sectors"),
  mySectors: () => api.get("/alerts/sectors/my"),
  subscribeSectors: (codes: string[]) =>
    api.post("/alerts/sectors/subscribe", { sector_codes: codes }),
  list: () => api.get("/alerts"),
  create: (data: any) => api.post("/alerts", data),
  update: (id: string, data: any) => api.patch(`/alerts/${id}`, data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  matches: (params?: any) => api.get("/alerts/matches", { params }),
  unreadCount: () => api.get("/alerts/matches/count"),
  markRead: (id: string) => api.post(`/alerts/matches/${id}/read`),
  markAllRead: () => api.post("/alerts/matches/read-all"),
};

export const subscriptionsApi = {
  plans: () => api.get("/subscriptions/plans"),
  my: () => api.get("/subscriptions/my"),
  checkout: (data: any) => api.post("/subscriptions/checkout", data),
  cancel: (data: any) => api.post("/subscriptions/cancel", data),
};

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  users: (params?: any) => api.get("/admin/users", { params }),
  triggerIngestion: () => api.post("/admin/ingest/trigger"),
  reprocessTender: (id: string) => api.post(`/admin/ai/reprocess/${id}`),
};
