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

// ---------------- MEN (umumiy profil) ----------------
// Backend: users/urls.py -> GET/PATCH me/  — REAL, biznes egasi va kassir uchun umumiy.
export const meApi = {
  async get() {
    const { data } = await client.get("me/");
    return data;
  },
  async update(payload) {
    const { data } = await client.patch("me/", payload);
    return data;
  },
};

// ==================== KASSIR PANELI ====================
// MUHIM ESLATMA (backend sherikka ko'rsatiladigan ro'yxat):
// Hozircha backend'da quyidagilar YO'Q, shu sabab pastda "MOCK" deb belgilanган:
//   1) Kassir uchun alohida Dashboard statistikasi (bugungi tashrif/daromad/oxirgi tashrif)
//   2) QR kodni serverda tekshirish va mijoz ma'lumotini (ism, a'zolik, tashriflar) qaytarish
//   3) Mijozning a'zolik turiga qarab farqlanadigan chegirma foizi (hozir foiz butun biznesga bitta)
//   4) Xizmat turlari (Service) ro'yxati — narxlari bilan
//   5) Kassirning FAQAT o'ziga tegishli tashriflar tarixi (hozir tarix faqat biznes egasiga ochiq)
//
// Har bir funksiya avval REAL endpointni chaqiradi; agar u hali mavjud bo'lmasa (404/500),
// UI sinishi/qulashi uchun emas, balki dizaynni sinab ko'rish uchun MOCK ma'lumotga tushadi.
// Backend tayyor bo'lgach, faqat shu faylni yangilang — boshqa hech qanday joyni o'zgartirish shart emas.

const MOCK_SERVICES = [
  { id: "soch-olish", name: "Soch olish", price: 50000 },
  { id: "soqol-qirish", name: "Soqol qirish", price: 28000 },
  { id: "soch-soqol", name: "Soch + Soqol", price: 72000 },
  { id: "bola-soch", name: "Bola soch", price: 35000 },
];

const MOCK_CUSTOMER = {
  id: "mock-1",
  full_name: "Jasur Abdullayev",
  membership_type: "Premium a'zo",
  membership_status: "Faol",
  code: "#123213143",
  visits_count: 47,
  last_visit_days_ago: 3,
  discount_percent: 35,
};

function buildMockDashboard() {
  return {
    today_visits: 5,
    today_discount_amount: 115750,
    today_revenue: 447500,
    last_visit_time: "14:32",
  };
}

const MOCK_HISTORY = [
  {
    id: "m1",
    customer_name: "Jasur Abdullayev",
    service_name: "Soch olish",
    applied_percent: 35,
    purchase_amount: 50000,
    discount_amount: 17500,
    used_at: new Date().toISOString(),
  },
  {
    id: "m2",
    customer_name: "Sherzod Karimov",
    service_name: "Soqol qirish",
    applied_percent: 30,
    purchase_amount: 28000,
    discount_amount: 8400,
    used_at: new Date().toISOString(),
  },
];

export const cashierApi = {
  // ✅ REAL backend: discounts/urls.py -> POST cashier/apply-discount/
  // payload: { customer_email?, purchase_amount }
  // Wizard'dagi qo'shimcha maydonlar (service_name, comment, customer_name) hozircha
  // backend'da saqlanmaydi, lekin xato bermasin deb baribir yuboriladi (DRF ortiqcha
  // maydonlarni jim e'tiborsiz qoldiradi).
  async applyDiscount(payload) {
    const { data } = await client.post("cashier/apply-discount/", payload);
    return data;
  },

  // ⚠️ MOCK — real bo'lganda: GET cashier/dashboard/
  async dashboard() {
    try {
      const { data } = await client.get("cashier/dashboard/");
      return data;
    } catch {
      return buildMockDashboard();
    }
  },

  // ⚠️ MOCK — real bo'lganda: POST cashier/scan-qr/ { qr_code } -> mijoz ma'lumotlari
  async verifyQr(qrCode) {
    try {
      const { data } = await client.post("cashier/scan-qr/", {
        qr_code: qrCode,
      });
      return data;
    } catch {
      return {
        ...MOCK_CUSTOMER,
        code: `#${String(Math.floor(Math.random() * 900000) + 100000)}`,
      };
    }
  },

  // ⚠️ MOCK — real bo'lganda: GET cashier/history/  (search, filtr, pagination bilan)
  async history(params = {}) {
    try {
      const { data } = await client.get("cashier/history/", { params });
      return data.results ?? data;
    } catch {
      return MOCK_HISTORY;
    }
  },

  // ⚠️ MOCK — real bo'lganda: GET my-business/services/
  async services() {
    try {
      const { data } = await client.get("my-business/services/");
      return data.results ?? data;
    } catch {
      return MOCK_SERVICES;
    }
  },
};
