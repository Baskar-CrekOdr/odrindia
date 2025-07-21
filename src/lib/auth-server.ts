import { NextRequest } from 'next/server';
import { User, SessionData } from '@/types/auth';
import { parseJWT } from '@/lib/jwt';

/**
 * Unified server-side authentication function for Next.js middleware/edge runtime
 * Note: This runs in the edge runtime, so we can't use Node.js-specific libraries
 */
export async function getJwtUser(request: NextRequest): Promise<User | null> {
  try {
    // Method 1: Check for JWT in Authorization header (preferred)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return parseClientSideJWT(token);
    }

    // Method 2: Check for JWT in access_token cookie
    const accessTokenCookie = request.cookies.get('access_token');
    if (accessTokenCookie?.value) {
      return parseClientSideJWT(accessTokenCookie.value);
    }

    // Method 3: Check for session cookie (legacy support)
    const sessionCookie = request.cookies.get('odrindia_session');
    if (sessionCookie?.value) {
      return verifySessionCookie(sessionCookie.value);
    }

    // Method 4: Fallback - check for x-auth-user header (backward compatibility)
    const authUserHeader = request.headers.get('x-auth-user');
    if (authUserHeader) {
      try {
        const userData = JSON.parse(decodeURIComponent(authUserHeader));
        return userData as User;
      } catch (error) {
        console.error('Error parsing x-auth-user header:', error);
      }
    }

    // Development mode fallback
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH === 'true') {
      console.warn('Using mock user for development. This is not secure for production.');
      return {
        id: 'dev-user-id',
        name: 'Development User',
        email: 'dev@example.com',
        userRole: 'ADMIN',
        createdAt: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Error in authentication:', error);
    return null;
  }
}

/**
 * Parse JWT token without verification (for client-side/edge runtime)
 * Note: This should only be used when full JWT verification isn't possible
 * The backend should still verify JWTs properly
 */
function parseClientSideJWT(token: string): User | null {
  try {
    const payload = parseJWT(token);
    if (!payload) return null;
    
    // Extract user information from JWT payload
    return {
      id: payload.id || payload.sub || '',
      name: payload.name || '',
      email: payload.email || '',
      userRole: (payload.userRole as "INNOVATOR" | "MENTOR" | "ADMIN" | "OTHER" | "FACULTY") || 'OTHER',
      createdAt: new Date().toISOString(), // We don't store this in JWT
    };
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
}

/**
 * Verify session cookie (legacy support)
 * This handles the old Base64-encoded JSON format
 */
function verifySessionCookie(cookieValue: string): User | null {
  try {
    // Try to decode as Base64 JSON (legacy format)
    const sessionData: SessionData = JSON.parse(
      Buffer.from(cookieValue, 'base64').toString('utf-8')
    );

    // Verify session expiration
    if (sessionData.exp && new Date(sessionData.exp) > new Date()) {
      console.log('Valid session found:', sessionData.user.email);
      return sessionData.user;
    } else {
      console.log('Session expired');
      return null;
    }
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}
