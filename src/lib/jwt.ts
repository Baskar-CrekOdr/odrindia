/**
 * Unified JWT Utilities
 * Provides consistent JWT handling across the frontend
 */

import { jwtDecode } from "jwt-decode";
import { JWTPayload, User } from "@/types/auth";

/**
 * Parse and decode JWT token using the standard jwt-decode library
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}

/**
 * Extract user information from JWT token
 * @param token JWT token string
 * @returns User object or null if invalid
 */
export function getUserFromJWT(token: string): User | null {
  try {
    const decoded = parseJWT(token);
    if (!decoded) return null;

    return {
      id: decoded.id || '',
      name: decoded.name,
      email: decoded.email,
      userRole: decoded.userRole as "INNOVATOR" | "MENTOR" | "ADMIN" | "OTHER" | "FACULTY",
      createdAt: new Date().toISOString(), // We don't store createdAt in JWT
    };
  } catch (error) {
    console.error("Error extracting user from JWT:", error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid
 */
export function isJWTExpired(token: string): boolean {
  try {
    const decoded = parseJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get time remaining until JWT expires
 * @param token JWT token string
 * @returns seconds remaining or 0 if expired/invalid
 */
export function getJWTTimeRemaining(token: string): number {
  try {
    const decoded = parseJWT(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - currentTime;
    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
}
