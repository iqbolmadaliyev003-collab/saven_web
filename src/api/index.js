import client, { clearTokens, setTokens } from "./client";

export const authApi = {
  async login(login, password) {
    const { data } = await client.post("auth/login/", { login, password });
    setTokens({ access: data.access, refresh: data.refresh });
    return data.business;
  },
  logout() {
    clearTokens();
  },
  isAuthenticated() {
    return !!localStorage.getItem("saven_access");
  },
};

export const businessApi = {
  async me() {
    const { data } = await client.get("business/me/");
    return data;
  },
  async update(payload) {
    const { data } = await client.patch("business/me/", payload);
    return data;
  },
};

export const dashboardApi = {
  async stats() {
    const { data } = await client.get("dashboard/");
    return data;
  },
};

export const statistikaApi = {
  async summary(periodDays = 30) {
    const { data } = await client.get("statistika/", { params: { period: periodDays } });
    return data;
  },
};

export const discountsApi = {
  async list() {
    const { data } = await client.get("discounts/");
    return data.results ?? data;
  },
  async create(payload) {
    const { data } = await client.post("discounts/", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await client.patch(`discounts/${id}/`, payload);
    return data;
  },
  async remove(id) {
    await client.delete(`discounts/${id}/`);
  },
  async toggleActive(id) {
    const { data } = await client.post(`discounts/${id}/toggle_active/`);
    return data;
  },
};

export const cashiersApi = {
  async list() {
    const { data } = await client.get("cashiers/");
    return data.results ?? data;
  },
  async create(payload) {
    const { data } = await client.post("cashiers/", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await client.patch(`cashiers/${id}/`, payload);
    return data;
  },
  async remove(id) {
    await client.delete(`cashiers/${id}/`);
  },
  async toggleActive(id) {
    const { data } = await client.post(`cashiers/${id}/toggle_active/`);
    return data;
  },
};

export const historyApi = {
  async list(params = {}) {
    const { data } = await client.get("discount-history/", { params });
    return data.results ?? data;
  },
};

export const notificationsApi = {
  async list() {
    const { data } = await client.get("notifications/");
    return data.results ?? data;
  },
  async markRead(id) {
    const { data } = await client.post(`notifications/${id}/mark_read/`);
    return data;
  },
  async markAllRead() {
    await client.post("notifications/mark_all_read/");
  },
};
