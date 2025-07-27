// CSRF utility for Next.js frontend

import { apiFetch } from "./api";

export async function fetchAndStoreCsrfToken() {
  const res = await apiFetch("/csrf-token");
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const { csrfToken } = await res.json();
  if (typeof window !== "undefined") {
    let meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', csrfToken);
  }
  return csrfToken;
}

export function getCsrfToken() {
  if (typeof window === "undefined") return null;
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
}
