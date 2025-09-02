"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { initializeGoogleAuth, renderGoogleButton } from "@/lib/google-auth";
import { apiFetch } from "@/lib/api";
import { GoogleUser } from "@/types/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function SignInClient() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signInWithGoogle } = useAuth();
  const callbackUrl = searchParams?.get("redirect") || "/";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

  // Render Google button only once on mount (for fallback UX)
  useEffect(() => {
    const googleButtonContainer = document.getElementById("google-signin-container");
    if (googleButtonContainer) {
      renderGoogleButton(googleButtonContainer, "signin_with");
    }
  }, []);

  // Handle form submission for email/password login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the login API endpoint
      const response = await apiFetch("/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Always send cookies
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Use the auth context login function to store user data
      login(data.user);
      // Redirect to home page
      // router.push("/home");
      router.push(callbackUrl);

    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In with improved implementation
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Google Auth using unified utilities
      await initializeGoogleAuth(async (googleUser: GoogleUser) => {
        try {
          // Validate email and name
          if (!googleUser.email || !googleUser.name) {
            throw new Error("Incomplete user information from Google");
          }

          const result = await signInWithGoogle({
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture || ""
          });

          if (result.needsProfileCompletion) {
            // Redirect to profile completion page with proper user data
            const params = new URLSearchParams({
              email: googleUser.email,
              name: googleUser.name,
              image: googleUser.picture || "",
              fromGoogle: "true"
            });
            router.push(`/complete-profile?${params.toString()}`);
          } else {
            // User has complete profile, redirect to home
            const redirectTo = searchParams?.get("redirect") || "/home";
            router.push(redirectTo);
          }
        } catch (error) {
          throw error;
        }
      }, (error) => {
        setError(error.message || "Google sign-in failed");
        setLoading(false);
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-[70vh] flex flex-col lg:flex-row">
      {/* Mobile header for branding (shown on small screens) */}
            <motion.div
        className="lg:hidden bg-gradient-to-r from-[#0a1e42] to-[#162d5a] px-4 py-6 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        
        <motion.div
          className="absolute top-2 right-4 w-16 h-16 rounded-full bg-white/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Welcome Back to ODR
          </h1>
          <p className="text-sm text-blue-100">
            Online Dispute Resolution Platform
          </p>
        </div>
      </motion.div>

      {/* Sign in form */}
      <motion.div
        className="flex-1 lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-6 sm:py-8 lg:px-12 xl:px-16 relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}>
        
        {/* Background animation elements */}
        <motion.div
          className="absolute top-8 left-24 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-blue-500/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-8 right-24 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-sky-400/15"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.div
          className="w-full max-w-sm sm:max-w-md mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl relative z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          
          <motion.h1
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center text-[#0a1e42]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            Sign In
          </motion.h1>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}>
              <Alert
                variant="destructive"
                className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}>
            {/* Google Sign In Button - Visible Container */}
            <div id="google-signin-container" className="w-full">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium transition-all duration-200 flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="relative mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-5 lg:gap-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}>
            <motion.div
              className="flex flex-col gap-2"
              variants={fadeInUp}>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-gray-300 focus:border-[#0a1e42] focus:ring-[#0a1e42]"
                required
              />
            </motion.div>
            <motion.div
              className="flex flex-col gap-2"
              variants={fadeInUp}>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-gray-300 focus:border-[#0a1e42] focus:ring-[#0a1e42]"
                required
              />
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-1 sm:mt-2">
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 lg:h-12 bg-[#0a1e42] hover:bg-[#162d5a] text-sm sm:text-base font-medium transition-all duration-200"
                disabled={loading}>
                {loading ? (
                  <motion.span
                    className="inline-flex items-center"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}>
                    Signing In...
                  </motion.span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}>
            <span>Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-[#0a1e42] hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      <SignInClient />
    </Suspense>
  );
}