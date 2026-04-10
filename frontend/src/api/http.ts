import axios, { type AxiosError } from "axios";

const LOG = "[MyControl FE]";
const apiBase = () => import.meta.env.VITE_URL ?? "(VITE_URL não definido)";

function safeStringify(data: unknown, max = 800): string {
  try {
    const s = typeof data === "string" ? data : JSON.stringify(data);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return "[unserializable]";
  }
}

axios.interceptors.request.use((config) => {
  const base = config.baseURL ?? "";
  const path = config.url ?? "";
  const full =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  console.log(
    `${LOG} →`,
    (config.method ?? "get").toUpperCase(),
    full || path,
    "| baseURL=",
    apiBase(),
    `t=${new Date().toISOString()}`,
  );
  return config;
});

axios.interceptors.response.use(
  (response) => {
    const preview =
      typeof response.data === "object" && response.data !== null
        ? safeStringify(response.data, 500)
        : String(response.data).slice(0, 200);
    console.log(`${LOG} ← OK`, response.status, response.config.url, preview);
    return response;
  },
  (err: AxiosError) => {
    const status = err.response?.status;
    const url = err.config?.url;
    const base = err.config?.baseURL;
    const data = err.response?.data;
    const code = err.code;

    console.error(`${LOG} ← ERRO`, {
      status,
      code,
      url,
      baseURL: base,
      message: err.message,
      body: data !== undefined ? safeStringify(data) : undefined,
      t: new Date().toISOString(),
    });
    return Promise.reject(err);
  },
);
