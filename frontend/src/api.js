const BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export function token() {
  return localStorage.getItem("cwm_token");
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token()) {
    headers.Authorization = `Bearer ${token()}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({
    detail: "Unexpected server response"
  }));

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}