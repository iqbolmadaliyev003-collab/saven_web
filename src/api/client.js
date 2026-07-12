import axios from "axios";

// Backend prefixi "api/v1/" (config/urls.py). Avval "/api/" edi — shuning uchun
// hech bir so'rov ishlamayotgan edi.
const client = axios.create({
  baseURL: "/api/v1/",
});

function getTokens() {
  return {
    access: localStorage.getItem("savin_access"),
    refresh: localStorage.getItem("savin_refresh"),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("savin_access", access);
  if (refresh) localStorage.setItem("savin_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("savin_access");
  localStorage.removeItem("savin_refresh");
}

client.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshing = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const { refresh } = getTokens();
      if (!refresh) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }
      original._retry = true;
      try {
        // Backend'dagi haqiqiy yo'l: users/urls.py -> "auth/token/refresh/"
        refreshing =
          refreshing ||
          axios.post("/api/v1/auth/token/refresh/", { refresh }).then((res) => {
            setTokens({ access: res.data.access });
            refreshing = null;
            return res.data.access;
          });
        const newAccess = await refreshing;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default client;
