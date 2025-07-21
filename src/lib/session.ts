/**
 * Unified Session Management Utilities
 * Provides consistent session handling across the application
 */

import { User } from "@/types/auth";

// Session storage keys
const SESSION_KEYS = {
  USER_DATA: 'odr_user_data',
  SESSION_ID: 'odr_session_id',
  LAST_ACTIVITY: 'odr_last_activity',
  CSRF_TOKEN: 'odr_csrf_token'
} as const;

/**
 * Store user session data in sessionStorage
 * @param user User object to store
 */
export function storeUserSession(user: User): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = {
      user,
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify(sessionData));
    sessionStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to store user session:', error);
  }
}

/**
 * Retrieve user session data from sessionStorage
 * @returns User object or null if not found/invalid
 */
export function getUserSession(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEYS.USER_DATA);
    if (!sessionData) return null;
    
    const parsed = JSON.parse(sessionData);
    
    // Validate session age (optional - remove if not needed)
    const timestamp = new Date(parsed.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    // If session is older than 24 hours, consider it stale
    if (hoursDiff > 24) {
      clearUserSession();
      return null;
    }
    
    return parsed.user;
  } catch (error) {
    console.error('Failed to retrieve user session:', error);
    return null;
  }
}

/**
 * Clear all user session data
 */
export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove all ODR-specific session data
    Object.values(SESSION_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    
    // Legacy cleanup - remove old keys that might still exist
    const legacyKeys = [
      'user',
      'accessToken', 
      'refreshToken',
      'csrfToken',
      'profile',
      'needsProfileCompletion',
      'authToken',
      'userRole'
    ];
    
    legacyKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear user session:', error);
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to update last activity:', error);
  }
}

/**
 * Get last activity timestamp
 * @returns Date object or null if not found
 */
export function getLastActivity(): Date | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const timestamp = sessionStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to get last activity:', error);
    return null;
  }
}

/**
 * Check if user session exists and is valid
 * @returns boolean
 */
export function hasValidSession(): boolean {
  return getUserSession() !== null;
}
