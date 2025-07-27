"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { fetchAndStoreCsrfToken } from "@/lib/csrf";
import { 
  User, 
  AuthResponse, 
  SessionResponse,
  GoogleUser 
} from "@/types/auth";
import { 
  storeUserSession, 
  getUserSession, 
  clearUserSession,
  updateLastActivity 
} from "@/lib/session";

// Remove trailing slash to prevent double slashes in URLs
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/$/, "");

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  signup: (userData: any) => Promise<any>;
  signInWithGoogle: (googleUser: GoogleUser) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
  completeProfile: (profileData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set client flag to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
    // Fetch CSRF token on app load (client only)
    if (typeof window !== "undefined") {
      fetchAndStoreCsrfToken().catch((err) => {
        console.error("Failed to fetch CSRF token on app load:", err);
      });
    }
  }, []);

  // Initialize user state from session storage on client mount
  useEffect(() => {
    if (isClient) {
      const storedUser = getUserSession();
      if (storedUser) {
        setUser(storedUser);
        updateLastActivity();
      }
      setLoading(false);
    }
  }, [isClient]);

  // Debounced refreshUser function to prevent race conditions
  const refreshUser = useCallback(async () => {
    // Only run on client side
    if (!isClient) return;

    // Prevent multiple concurrent refresh attempts
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshPromiseRef.current = (async () => {
      try {
        const response = await apiFetch(`/auth/session`);
        if (response.ok) {
          const data: SessionResponse = await response.json();
          if (data.user) {
            // Merge needsProfileCompletion if present
            const userData = { 
              ...data.user, 
              needsProfileCompletion: data.needsProfileCompletion 
            };
            setUser(userData);
            storeUserSession(userData);
            updateLastActivity();
          } else {
            // Clear user state if session is invalid
            setUser(null);
            clearUserSession();
          }
        } else {
          // Clear user state on auth failure
          setUser(null);
          clearUserSession();
        }
      } catch (error) {
        console.error("Session refresh failed:", error);
        // Only clear user state if it's a network error, not auth error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn("Network error during session refresh, keeping current user state");
        } else {
          setUser(null);
          clearUserSession();
        }
      } finally {
        // Reset refresh promise after a delay to allow new refresh attempts
        refreshTimeoutRef.current = setTimeout(() => {
          refreshPromiseRef.current = null;
        }, 2000);
        setLoading(false);
      }
    })();
    return refreshPromiseRef.current;
  }, [isClient]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    storeUserSession(userData);
    updateLastActivity();
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call the server logout endpoint to clear server-side cookies
      const response = await apiFetch(`/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Server logout successful:", data.message || "Cookies cleared");
      } else {
        console.warn("Server logout responded with error, but continuing with client cleanup");
      }
    } catch (error) {
      // Even if the server call fails, we should still clear client state
      console.error("Server logout failed, clearing client state anyway:", error);
    }
    
    // Clear all user-related state
    setUser(null);
    clearUserSession();
    
    // Clear any pending refresh operations
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    refreshPromiseRef.current = null;
    
    router.push("/signin");
  }, [router]);

  const signup = useCallback(
    async (userData: any) => {
      const response = await apiFetch(`/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      return data;
    },
    []
  );

  const signInWithGoogle = useCallback(
    async (googleUser: GoogleUser): Promise<AuthResponse> => {
      try {
        const response = await apiFetch(`/auth/google-signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture,
          }),
        });

        if (!response.ok) {
          throw new Error("Google sign-in failed");
        }

        const data: AuthResponse = await response.json();

        // Always set user in context, include needsProfileCompletion
        if (data.user) {
          const userData = { 
            ...data.user, 
            needsProfileCompletion: data.needsProfileCompletion 
          };
          setUser(userData);
          storeUserSession(userData);
          updateLastActivity();
        }

        return data;
      } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
      }
    },
    []
  );

  // Add a profile completion function
  const completeProfile = useCallback(
    async (profileData: any) => {
      try {
        const response = await apiFetch(`/auth/complete-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Profile completion failed" }));
          throw new Error(errorData.error || "Profile completion failed");
        }

        const data = await response.json();

        // Update user data only, include needsProfileCompletion if present
        if (data.user) {
          const userData = { 
            ...data.user, 
            needsProfileCompletion: data.needsProfileCompletion 
          };
          setUser(userData);
          storeUserSession(userData);
          updateLastActivity();
        }

        return data;
      } catch (error) {
        console.error("Profile completion error:", error);
        throw error;
      }
    },
    []
  );

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    signInWithGoogle,
    refreshUser,
    completeProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Route protection HOC
export const withAuth = (Component: React.ComponentType<unknown>) => {
  return function AuthenticatedComponent(props: Record<string, unknown>) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        const currentPath = window.location.pathname;
        // Prevent infinite loops - don't redirect if we're already at /signin
        if (currentPath !== "/signin") {
          router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
};

// Admin route protection HOC
export const withAdminAuth = (Component: React.ComponentType<unknown>) => {
  return function AdminAuthenticatedComponent(props: Record<string, unknown>) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          const currentPath = window.location.pathname;
          router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
        } else if (user.userRole !== "ADMIN") {
          router.push("/"); // Redirect non-admins to home page
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      );
    }

    if (!user || user.userRole !== "ADMIN") {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
};
