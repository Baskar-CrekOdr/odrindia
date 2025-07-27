"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
interface PageGuardProps {
  children: ReactNode;
  requiredRole?: "ADMIN" | "MENTOR" | "INNOVATOR" | "OTHER" | "FACULTY";
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: ("ADMIN" | "MENTOR" | "INNOVATOR" | "OTHER" | "FACULTY")[];
  checkPermission?: (user: unknown) => boolean | Promise<boolean>;
}

export default function PageGuard({
  children,
  requiredRole,
  requireAuth = true,
  redirectTo = "/signin",
  allowedRoles,
  checkPermission,
}: PageGuardProps) {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform checks if not loading and we're certain about authentication status
    if (!loading) {
      console.log("PageGuard - Auth status determined:", { 
        authenticated: !!user, 
        userRole: user?.userRole,
        requireAuth,
        requiredRole,
        allowedRoles
      });
      
      // Case 1: Authentication required but not authenticated
      if (requireAuth && !user) {
        const currentPath = window.location.pathname;
        console.log(`PageGuard - Authentication required but not logged in, current path: ${currentPath}`);
        
        // Avoid redirect loops by checking if we're not already at the redirect destination
        if (currentPath !== redirectTo && currentPath !== "/complete-profile") {
          console.log(`PageGuard - Redirecting to ${redirectTo} with return URL`);
          router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
          
          // Display a toast notification
          toast.info("Please log in to access this page");
        }
      }
      // Case 1.5: User authenticated but needs profile completion
      else if (requireAuth && user && user.needsProfileCompletion) {
        const currentPath = window.location.pathname;
        console.log(`PageGuard - User needs profile completion, current path: ${currentPath}`);
        
        // Only redirect if not already on complete-profile page
        if (currentPath !== "/complete-profile") {
          console.log(`PageGuard - Redirecting to complete-profile`);
          router.push(`/complete-profile?redirect=${encodeURIComponent(currentPath)}`);
          
          toast.info("Please complete your profile to continue");
        }
      }
      // Case 2: Specific role required but user doesn't have it
      else if (requiredRole && user && user.userRole !== requiredRole) {
        console.log(`PageGuard - Required role ${requiredRole} not met, user has ${user.userRole}`);
        router.push("/");
        
        toast.error("You don't have permission to access this page");
      }
      // Case 3: Allowed roles specified but user's role not included
      else if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.userRole)) {
        console.log(`PageGuard - User role ${user.userRole} not in allowed roles:`, allowedRoles);
        router.push("/");
        
        toast.error("You don't have permission to access this page");
      }
      // Case 4: Custom permission check fails
      else if (checkPermission && user) {
        const hasPermission = checkPermission(user);
        if (hasPermission === false) {
          console.log(`PageGuard - Custom permission check failed`);
          router.push("/");
          
          toast.error("You don't have permission to access this page");
        }
      }
    }
  }, [user, loading, router, requireAuth, requiredRole, redirectTo, allowedRoles, checkPermission]);

  if (
    loading ||
    (requireAuth && !user) ||
    (requireAuth && user && user.needsProfileCompletion && window.location.pathname !== "/complete-profile") ||
    (requiredRole && user && user.userRole !== requiredRole)
  ) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0a1e42]"></div>
          <p className="text-lg text-gray-600">
            {loading ? "Loading..." : 
             requireAuth && !user ? "Checking authentication..." :
             requireAuth && user && user.needsProfileCompletion ? "Redirecting to complete profile..." :
             "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
