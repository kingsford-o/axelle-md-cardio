const BASE = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  modules: () => request("/api/modules"),
  module: (slug) => request(`/api/modules/${slug}`),
  questions: (slug) => request(`/api/modules/${slug}/questions`),
  myths: () => request("/api/myths"),
  saveAttempt: (body) => request("/api/attempts", { method: "POST", body: JSON.stringify(body) }),
  progress: (anonId) => request(`/api/progress/${anonId}`),
  review: (anonId) => request(`/api/review/${anonId}`),
};