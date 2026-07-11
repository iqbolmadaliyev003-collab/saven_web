import axios from "axios";

const client = axios.create({
  baseURL: "/api/",
});

function getTokens() {
  return {
    access: localStorage.getItem("saven_access"),
    refresh: localStorage.getItem("saven_refresh"),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("saven_access", access);
  if (refresh) localStorage.setItem("saven_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("saven_access");
  localStorage.removeItem("saven_refresh");
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
        refreshing =
          refreshing ||
          axios.post("/api/auth/refresh/", { refresh }).then((res) => {
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
  }
);

export default client;
