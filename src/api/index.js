import client, { clearTokens, setTokens } from "./client";

// ---------------- AUTH ----------------
// Backend: users/urls.py -> POST auth/login/  { email, password } -> { tokens: {access, refresh}, user }
export const authApi = {
  async login(email, password) {
    const { data } = await client.post("auth/login/", { email, password });
    setTokens({ access: data.tokens.access, refresh: data.tokens.refresh });
    return data.user;
  },
  logout() {
    clearTokens();
  },
  isAuthenticated() {
    return !!localStorage.getItem("savin_access");
  },
};

// ---------------- BIZNES PROFILI ----------------
// Backend: businesses/urls.py -> GET/PATCH my-business/
export const businessApi = {
  async me() {
    const { data } = await client.get("my-business/");
    return data;
  },
  async update(payload) {
    const { data } = await client.patch("my-business/", payload);
    return data;
  },
};

// ---------------- DASHBOARD ----------------
// Backend: businesses/urls.py -> GET my-business/dashboard/
export const dashboardApi = {
  async stats() {
    const { data } = await client.get("my-business/dashboard/");
    return data;
  },
};

// ---------------- CHEGIRMA ----------------
// MUHIM: backend'da chegirma CRUD ro'yxat emas — har bir biznesga BITTA joriy
// foiz biriktirilgan. Uni o'zgartirish faqat "so'rov yuborish -> admin tasdiqlaydi"
// jarayoni orqali bo'ladi (discounts/urls.py).
export const discountApi = {
  async me() {
    // { current_percent, pending_request }
    const { data } = await client.get("my-business/discount/");
    return data;
  },
  async requestChange(newPercent, reason = "") {
    const { data } = await client.post("my-business/discount/change-request/", {
      new_percent: newPercent,
      reason,
    });
    return data;
  },
};

// ---------------- STATISTIKA ----------------
// Backend "period" sifatida faqat "week" yoki "month" qabul qiladi (kunlar soni emas).
export const statistikaApi = {
  async summary(period = "week") {
    const { data } = await client.get("my-business/discount/statistics/", {
      params: { period },
    });
    return data;
  },
};

// ---------------- KASSIRLAR ----------------
// Backend: businesses/urls.py -> my-business/cashiers/ , my-business/cashiers/<id>/
export const cashiersApi = {
  async list() {
    const { data } = await client.get("my-business/cashiers/");
    return data.results ?? data;
  },
  // payload: { email, password, full_name }
  async create(payload) {
    const { data } = await client.post("my-business/cashiers/", payload);
    return data;
  },
  // payload: { full_name, is_active } — backend'da alohida toggle endpoint yo'q,
  // shu sabab holatni ham shu PATCH orqali o'zgartiramiz.
  async update(id, payload) {
    const { data } = await client.patch(`my-business/cashiers/${id}/`, payload);
    return data;
  },
  async remove(id) {
    await client.delete(`my-business/cashiers/${id}/`);
  },
};

// ---------------- CHEGIRMA TARIXI ----------------
// Backend: discounts/urls.py -> GET my-business/discount/history/
export const historyApi = {
  async list(params = {}) {
    const { data } = await client.get("my-business/discount/history/", {
      params,
    });
    return data.results ?? data;
  },
  // Backend tayyor CSV export beradi (my-business/discount/history/export/),
  // shuning uchun jadvalni qayta CSV'ga aylantirish shart emas.
  async exportCsv(params = {}) {
    const { data } = await client.get("my-business/discount/history/export/", {
      params,
      responseType: "blob",
    });
    return data;
  },
};

// ---------------- BILDIRISHNOMALAR ----------------
// Backend: notifications/urls.py
export const notificationsApi = {
  async list() {
    const { data } = await client.get("notifications/");
    return data.results ?? data;
  },
  async markRead(id) {
    const { data } = await client.post(`notifications/${id}/read/`);
    return data;
  },
  async markAllRead() {
    await client.post("notifications/read-all/");
  },
};
