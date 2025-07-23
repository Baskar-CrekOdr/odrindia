/**
 * Google Authentication Utility
 * Provides reusable functions for Google OAuth integration
 */

import { parseJWT } from "@/lib/jwt";
import { GoogleUser } from "@/types/auth";

/**
 * Initialize Google OAuth
 * @param onSuccess Callback function to execute when Google sign-in is successful
 * @param onError Callback function to execute when Google sign-in encounters an error
 */
export async function initializeGoogleAuth(
  onSuccess: (googleUser: GoogleUser) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
      throw new Error("Google OAuth is not available");
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google Client ID is missing. Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set in your environment");
      throw new Error("Google Client ID is not configured");
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        try {
          if (!response.credential) {
            throw new Error("No credential returned from Google");
          }

          // Use unified JWT parsing instead of custom implementation
          const payload = parseJWT(response.credential);

          if (!payload || !payload.email) {
            throw new Error("Invalid Google user data");
          }

          const googleUser: GoogleUser = {
            email: payload.email,
            name: payload.name || '',
            picture: payload.picture
          };

          onSuccess(googleUser);
        } catch (error) {
          if (error instanceof Error) {
            onError(error);
          } else {
            onError(new Error("Unknown Google sign-in error"));
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // Trigger the Google sign-in prompt with error handling
    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification && (notification.isNotDisplayed() || notification.isSkippedMoment())) {
          const reason = notification.isNotDisplayed() 
            ? notification.getNotDisplayedReason() 
            : notification.getSkippedReason();
          console.log("Google One Tap not displayed:", reason);
        }
      });
    } catch (err) {
      console.error("Error displaying Google One Tap:", err);
      // We don't throw here because the button still works
    }
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error("Failed to initialize Google OAuth"));
    }
  }
}

/**
 * Render a Google sign-in button in the specified container
 */
export function renderGoogleButton(container: HTMLElement, text: "signin_with" | "signup_with" = "signup_with"): void {
  if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
    console.error("Google OAuth is not available");
    return;
  }

  if (!container) {
    console.error("Button container element not provided");
    return;
  }

  // Clear the container first
  container.innerHTML = '';
  
  try {
    window.google.accounts.id.renderButton(
      container,
      {
        theme: "outline",
        size: "large",
        width: container.offsetWidth,
        text: text,
      }
    );
  } catch (err) {
    console.error("Failed to render Google button:", err);
    // Add a fallback button
    container.innerHTML = `
      <button class="google-button" style="width:100%;padding:10px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #ddd;border-radius:4px;">
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-4.53H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
        </svg>
        <span style="margin-left:8px;">Sign up with Google</span>
      </button>
    `;
  }
}