import axios from "axios";

axios.interceptors.request.use((config) => {
  const base = config.baseURL ?? "";
  const path = config.url ?? "";
  const full = base && path.startsWith("http") ? path : `${base}${path}`;
  console.log("[API →]", (config.method ?? "get").toUpperCase(), full || path);
  return config;
});

axios.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    console.error("[API ← erro]", status, err.config?.url, data ?? err.message);
    return Promise.reject(err);
  },
);
