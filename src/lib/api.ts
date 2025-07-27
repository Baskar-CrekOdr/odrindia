import { getCsrfToken, fetchAndStoreCsrfToken } from "@/lib/csrf";

// export const API_BASE_URL = "https://13.233.201.37";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//export const API_BASE_URL = "http://localhost:4000/api";
export async function apiFetch(path: string, options: RequestInit = {}) {
  // Create headers object with proper typing
  const headers = new Headers(options.headers || {});

  // Always set Content-Type for non-GET requests
  if (
    ((options.method && options.method !== 'GET') || options.body) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Add CSRF token for mutating requests (but make it optional in development)
  const csrfToken = getCsrfToken();
  if (csrfToken && options.method && ["POST", "PUT", "DELETE"].includes(options.method.toUpperCase())) {
    headers.set("x-csrf-token", csrfToken);
  } else if (options.method && ["POST", "PUT", "DELETE"].includes(options.method.toUpperCase())) {
    // If no CSRF token available, log a warning but don't fail
    console.warn(`No CSRF token available for ${options.method} request to ${path}`);
  }

  // Set CORS headers required by backend (for fetch, these are set by browser, but for clarity):
  headers.set("Accept", "application/json");

  // Always set credentials: 'include' unless explicitly overridden
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  };

  let triedRefresh = false;
  while (true) {
    try {
     // console.log(`Making API request to: ${API_BASE_URL}${path}`);
      const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
     // console.log(`API Response from ${path}: Status ${response.status}`);

      if (response.status === 401 && !triedRefresh && path !== '/auth/refresh-token' && path !== '/auth/login') {
        // Try to refresh token once
        console.warn(`401 from ${path}, attempting refresh-token`);
        const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include'
        });
        if (refreshResp.ok) {
          triedRefresh = true;
          continue; // Retry original request
        } else {
          // Refresh failed, log out user if possible
          if (typeof window !== 'undefined') {
            window.localStorage?.clear();
          }
          throw new Error('Session expired. Please sign in again.');
        }
      }

      if (response.status === 403) {
        // CSRF failure - try to fetch new token and suggest retry
        console.warn("CSRF token validation failed, attempting to refresh token");
        try {
          await fetchAndStoreCsrfToken();
          throw new Error("Security token expired. Please try your request again.");
        } catch (csrfError) {
          throw new Error("Your session has expired. Please refresh the page and try again.");
        }
      }

      return response;
    } catch (err) {
      console.error(`Network error in apiFetch to ${path}:`, err);
      throw err;
    }
  }
}

export {};
