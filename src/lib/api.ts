import { getCsrfToken, fetchAndStoreCsrfToken } from "@/lib/csrf";

// Define extended options interface with our custom properties
interface ApiOptions extends RequestInit {
  isRefreshAttempt?: boolean;
}

// export const API_BASE_URL = "https://13.233.201.37";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//export const API_BASE_URL = "http://localhost:4000/api";
export async function apiFetch(path: string, options: ApiOptions = {}) {
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

      // Handle 401 errors
      if (response.status === 401) {
        // Try token refresh if not already attempting it
        if (!options.isRefreshAttempt) {
          try {
            const refreshed = await refreshTokens();
            if (refreshed) {
              // Retry original request with new tokens - fix: use path instead of endpoint
              return apiFetch(path, { ...options, isRefreshAttempt: true });
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        }
        
        // Clear session data
        if (typeof window !== 'undefined') {
          // Use session storage clear instead of localStorage to preserve other app data
          window.sessionStorage?.removeItem('userSession');
          
          // Redirect to login only if not on a public page
          const isPublicRoute = /^\/(login|register|$)/.test(window.location.pathname);
          if (!isPublicRoute) {
            // Use history state instead of immediate redirect to prevent interrupting rendering
            window.history.pushState({}, '', '/login?expired=true');
          }
        }
        
        // Use a more user-friendly error for UI display
        throw new Error('Your session has expired. Please sign in again to continue.');
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

// Add missing refreshTokens function if it doesn't exist elsewhere
async function refreshTokens(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return false;
  }
}

export {};
