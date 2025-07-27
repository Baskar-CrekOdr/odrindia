// CSRF utility for Next.js frontend

let csrfToken: string | null = null;

/**
 * Gets the stored CSRF token
 */
export function getCsrfToken(): string | null {
  // Check if we have a stored token
  if (csrfToken) return csrfToken;
  
  // If in browser, try to get from localStorage as fallback
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('csrfToken');
    if (storedToken) {
      csrfToken = storedToken;
      return storedToken;
    }
  }
  
  return null;
}

/**
 * Stores the CSRF token both in memory and localStorage
 */
export function storeCsrfToken(token: string): void {
  csrfToken = token;
  
  // Also persist in localStorage if in browser
  if (typeof window !== 'undefined') {
    localStorage.setItem('csrfToken', token);
  }
}

/**
 * Fetches a new CSRF token from the server and stores it
 */
export async function fetchAndStoreCsrfToken(): Promise<string> {
  try {
    console.log("Fetching new CSRF token");
    // Get API_BASE_URL directly from environment to avoid circular dependency
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    const response = await fetch(`${baseUrl}/csrf-token`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.csrfToken) {
      throw new Error('No CSRF token in response');
    }
    
    console.log("Received new CSRF token");
    storeCsrfToken(data.csrfToken);
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}

/**
 * Clears the stored CSRF token
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('csrfToken');
  }
}
