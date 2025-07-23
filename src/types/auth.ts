/**
 * Frontend Authentication Types
 * Contains all auth-related types for the frontend
 */

// Base user interface matching the database schema
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  userRole: "INNOVATOR" | "MENTOR" | "ADMIN" | "OTHER" | "FACULTY";
  contactNumber?: string | null;
  city?: string | null;
  country?: string | null;
  imageAvatar?: string | null;
  createdAt: string; // ISO string format
}

// Role-specific fields that can be attached based on user role
export interface RoleSpecificFields {
  // Innovator fields
  institution?: string | null;
  highestEducation?: string | null;
  courseName?: string | null;
  courseStatus?: string | null;

  // Mentor fields
  mentorType?: string | null;
  organization?: string | null;

  // Faculty fields
  course?: string | null;
  mentoring?: boolean | null;

  // Common fields across roles
  role?: string | null;
  expertise?: string | null;
  workplace?: string | null;
  description?: string | null;
}

// Mentor application status
export interface MentorApplicationStatus {
  hasMentorApplication?: boolean;
  isMentorApproved?: boolean;
  mentorRejectionReason?: string | null;
}

// Complete user type with all possible fields
export interface User extends BaseUser, RoleSpecificFields, MentorApplicationStatus {
  // Client-side computed field
  needsProfileCompletion?: boolean;
}

// JWT payload structure (including Google-specific fields)
export interface JWTPayload {
  id?: string;
  email: string;
  name: string;
  userRole?: string;
  picture?: string; // Google profile picture
  iat?: number;
  exp?: number;
  sub?: string; // Standard JWT subject field
}

// Authentication responses
export interface AuthResponse {
  user: User;
  needsProfileCompletion: boolean;
  message: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
  needsProfileCompletion?: boolean;
  expiresAt?: string;
  expiresIn?: number;
  error?: string;
}

// Google OAuth
export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

// Session cookie structure (what gets stored in the cookie)
export interface SessionData {
  user: User;
  exp: string; // ISO string
  iat: string; // ISO string
}
