"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import  {toast}  from "sonner";

// Animation variants
const pageTransition = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

// Mentor types mapping
// Mentor types mapping - must match the backend's MentorType enum
const mentorTypes = [
  { value: "tech", label: "Technical Expert", dbValue: "TECHNICAL_EXPERT" },
  { value: "law", label: "Legal Expert", dbValue: "LEGAL_EXPERT" },
  { value: "odr", label: "ODR Expert", dbValue: "ODR_EXPERT" },
  { value: "conflict", label: "Conflict Resolution Expert", dbValue: "CONFLICT_RESOLUTION_EXPERT" }
];

// User types mapping to backend UserRole enum
const userTypeToRoleMap = {
  "student": "INNOVATOR",
  "faculty": "FACULTY", 
  "mentor": "MENTOR",  // Special case - will be refined based on mentor subtype
  "tech": "MENTOR",
  "law": "MENTOR",
  "odr": "MENTOR",
  "conflict": "MENTOR",
  "other": "OTHER"
};

const steps = ["Basic Info", "User Type", "Details", "Review"];

function CompleteProfileClient() {
  const { user, completeProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // Get user data from URL params (for Google OAuth flow) or from auth context
  const [userDisplayData, setUserDisplayData] = useState({
    name: "",
    email: "",
    image: ""
  });

  const [formData, setFormData] = useState({
    // Basic info
    contactNumber: "",
    city: "",
    country: "",
    
    // User type
    userType: "",         // The actual backend userType value - corresponds to schema
    mainUserType: "",     // High-level type (student, mentor, faculty, other)
    mentorType: "",       // For mentor subtype selection
    
    // Education and institution fields
    institution: "",      // Generic institution field
    highestEducation: "", // Education level
    courseName: "",       // Course name for students
    courseStatus: "",     // In progress, completed, etc.
    
    // Faculty specific fields
    facultyInstitute: "", // Faculty's institution 
    facultyRole: "",      // Professor, Associate Professor, etc.
    facultyExpertise: "", // Areas of expertise
    facultyCourse: "",    // Courses taught
    facultyMentor: "",    // Whether faculty wants to mentor
    
    // Mentor type-specific fields
    organization: "",     // Generic organization name
    lawFirm: "",          // For legal experts
    techOrg: "",          // For tech experts
    role: "",             // Generic role/position field
    expertise: "",        // Areas of expertise
    
    // Other user type fields
    workplace: "",        // For other user types
    otherRole: "",        // Role for other user types
    
    // Common description field
    description: "",      // How they plan to use ODR Lab
    odrLabUsage: "",      // Kept for backward compatibility
  });

  // --- FIX: Always show the form if Google OAuth params are present, even if user is null ---
  useEffect(() => {
    if (!searchParams) return;
    const emailFromParams = searchParams.get("email");
    const nameFromParams = searchParams.get("name");
    const imageFromParams = searchParams.get("image");
    const fromGoogle = searchParams.get("fromGoogle");

    if (fromGoogle === "true" && emailFromParams) {
      setUserDisplayData({
        name: nameFromParams || "",
        email: emailFromParams,
        image: imageFromParams || ""
      });
    } else if (user) {
      setUserDisplayData({
        name: user.name,
        email: user.email,
        image: user.imageAvatar || ""
      });
    }

    // Only redirect to home if user is fully authenticated and NOT in Google OAuth flow
    if (
      !loading &&
      user &&
      user.contactNumber &&
      user.city &&
      user.country &&
      fromGoogle !== "true" &&
      !user.needsProfileCompletion
    ) {
      console.log("User profile complete, redirecting to home");
      router.push("/home");
      return;
    }

    // Only redirect to sign-in if no user and not in Google OAuth flow
    if (!loading && !user && !emailFromParams) {
      router.push("/signin");
      return;
    }
  }, [user, loading, router, searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setError(null);
    
    // Basic validation for each step
    if (step === 0) {
      // Step 1: Basic contact information validation
      if (!formData.contactNumber || !formData.city || !formData.country) {
        setError("Please fill in all required contact information");
        return;
      }
      
      // Validate phone number format (optional)
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.contactNumber)) {
        // Just a warning, not blocking
        console.warn("Phone number format may not be valid");
      }
      
    } else if (step === 1) {
      // Step 2: User type selection validation
      if (!formData.mainUserType) {
        setError("Please select your role");
        return;
      }
      
      // Map mainUserType to userType where appropriate
      let derivedUserType = "";
      
      switch (formData.mainUserType) {
        case "student":
          derivedUserType = "student";
          break;
        case "faculty":
          derivedUserType = "faculty";
          break;
        case "mentor":
          // For mentors, we'll set the specific type in the next step
          // Just ensure we have the main type set
          derivedUserType = "mentor"; // Temporary value, will be replaced in next step
          break;
        case "other":
          derivedUserType = "other";
          break;
      }
      
      // Update the userType if we derived one
      if (derivedUserType) {
        setFormData(prev => ({ ...prev, userType: derivedUserType }));
      }
      
    } else if (step === 2) {
      // Step 3: Type-specific field validation
      
      // Student validation
      if (formData.mainUserType === "student") {
        if (!formData.institution) {
          setError("Please enter your institution name");
          return;
        }
        // Other student fields could be validated here, but are optional
      } 
      
      // Mentor validation
      else if (formData.mainUserType === "mentor") {
        if (!formData.mentorType) {
          setError("Please select your mentor type");
          return;
        }
        
        // Set the specific userType based on mentor selection
        setFormData(prev => ({ ...prev, userType: formData.mentorType }));
        
        // Validate mentor-specific fields based on type
        switch (formData.mentorType) {
          case "tech":
            if (!formData.techOrg) {
              setError("Please enter your organization/company name");
              return;
            }
            break;
          case "law":
            if (!formData.lawFirm) {
              setError("Please enter your law firm/organization");
              return;
            }
            break;
          case "odr":
          case "conflict":
            if (!formData.organization) {
              setError("Please enter your organization");
              return;
            }
            break;
        }
      } 
      
      // Faculty validation
      else if (formData.mainUserType === "faculty") {
        if (!formData.facultyInstitute) {
          setError("Please enter your institution name");
          return;
        }
        // Other faculty fields could be validated here, but are optional
      } 
      
      // Other user type validation
      else if (formData.mainUserType === "other") {
        if (!formData.workplace) {
          setError("Please enter your workplace or organization");
          return;
        }
      }
    }
    
    // Advance to next step if validation passes
    setStep(step + 1);
  };
  
  const handlePrevious = () => {
    setStep(step - 1);
    setError(null);
  };

  /**
   * Helper function to handle mentor-specific role and organization based on mentor type
   * Maps frontend mentor types to backend enum values and extracts relevant fields
   */
  const getMentorTypeSpecificData = () => {
    // Find the matching mentor type object from our defined types
    const mentorTypeObj = mentorTypes.find(t => t.value === formData.mentorType);
    
    // Get the database enum value for this mentor type
    const dbMentorType = mentorTypeObj?.dbValue || "TECHNICAL_EXPERT";
    
    // Get organization based on mentor type - different fields for different mentor types
    let organization = "";
    switch (formData.mentorType) {
      case "tech":
        organization = formData.techOrg || "";
        break;
      case "law":
        organization = formData.lawFirm || "";
        break;
      case "odr":
      case "conflict":
        organization = formData.organization || "";
        break;
      default:
        organization = formData.organization || "";
    }
    
    return {
      mentorType: dbMentorType,
      organization: organization,
      role: formData.role || "",
      expertise: formData.expertise || ""
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Base profile data common to all user types
      let profileData: any = {
        userId: user?.id,
        email: userDisplayData.email,
        name: userDisplayData.name,
        image: userDisplayData.image,
        contactNumber: formData.contactNumber,
        city: formData.city,
        country: formData.country,
        description: formData.description || formData.odrLabUsage,
      };

      // Add user type mapping for the backend
      // First, determine the final userType value to send
      let finalUserType = formData.userType;
      
      // If this is a mentor with a specific type, use that specific type
      if (formData.mainUserType === "mentor" && formData.mentorType) {
        finalUserType = formData.mentorType;
      }
      
      // Add type-specific data based on the main user type
      if (formData.mainUserType === "student") {
        profileData = {
          ...profileData,
          userType: "student", // Maps to INNOVATOR in backend
          institution: formData.institution,
          highestEducation: formData.highestEducation,
          courseName: formData.courseName,
          courseStatus: formData.courseStatus
        };
      } 
      else if (formData.mainUserType === "faculty") {
        profileData = {
          ...profileData,
          userType: "faculty", // Maps to FACULTY in backend
          institution: formData.facultyInstitute,
          role: formData.facultyRole,
          expertise: formData.facultyExpertise,
          courseName: formData.facultyCourse,
          facultyMentor: formData.facultyMentor === "true" 
            ? true 
            : formData.facultyMentor === "false" ? false : undefined
        };
      } 
      else if (formData.mainUserType === "mentor") {
        // Get mentor specific data using our helper function
        const mentorSpecificData = getMentorTypeSpecificData();
        
        profileData = {
          ...profileData,
          userType: finalUserType, // The specific mentor type (tech, law, etc.)
          mentorType: mentorSpecificData.mentorType, // The backend enum value (TECHNICAL_EXPERT, etc.)
          organization: mentorSpecificData.organization,
          role: mentorSpecificData.role,
          expertise: mentorSpecificData.expertise
        };
      } 
      else {
        // For "other" user types
        profileData = {
          ...profileData,
          userType: "other", // Maps to OTHER in backend
          workplace: formData.workplace,
          role: formData.otherRole
        };
      }

      //console.log("Submitting profile data:", profileData);

      const result = await completeProfile(profileData);

      // Show success message
      toast.success("Profile completed!", {
        description: result.message || "Your profile has been successfully updated.",
        duration: 3000,
      });

      // Redirect to intended page or home
      const redirectTo = searchParams?.get("redirect") || "/home";
      
      // Add a small delay to ensure the auth state is updated
      setTimeout(() => {
        // Check if we're still on the complete-profile page to avoid redirect loops
        if (window.location.pathname === "/complete-profile") {
          router.push(redirectTo);
        }
      }, 1500);

    } catch (err) {
      console.error("Profile completion error:", err);
      setError(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FIX: Only block rendering if loading, not if user is null and Google params exist ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Only block rendering if neither user nor Google params are present
  const emailFromParams = searchParams?.get("email");
  if (!user && !emailFromParams) {
    return null;
  }

  // Step indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6 py-2">
        {steps.map((stepName, idx) => (
          <React.Fragment key={stepName}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  idx < step ? "bg-green-600 text-white" : 
                  idx === step ? "bg-blue-600 text-white" : 
                  "bg-gray-200 text-gray-600"
                }`}
              >
                {idx < step ? <CheckCircle className="h-5 w-5" /> : idx + 1}
              </div>
              <span className="text-xs mt-1">{stepName}</span>
            </div>
            {idx < steps.length - 1 && (
              <div 
                className={`h-0.5 w-10 mx-1 ${
                  idx < step ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Form steps
  const renderFormStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            key="step0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
          >
            <div className="space-y-6">
              {/* Contact Number */}
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  placeholder="Your mobile number"
                  required
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Your city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Your country"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 1:
        return (
          <motion.div 
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
          >
            <div className="space-y-6">
              {/* User Type Selection */}
              <div>
                <Label className="mb-3 block text-lg font-medium">I am a *</Label>
                <RadioGroup 
                  value={formData.mainUserType} 
                  onValueChange={(value) => handleInputChange("mainUserType", value)}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem id="student" value="student" />
                    <div>
                      <Label htmlFor="student" className="font-medium">Student Innovator</Label>
                      <p className="text-sm text-gray-500">Working on academic projects, research, or coursework</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem id="mentor" value="mentor" />
                    <div>
                      <Label htmlFor="mentor" className="font-medium">Mentor</Label>
                      <p className="text-sm text-gray-500">Provide expertise as a technical, legal, ODR or conflict resolution expert</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem id="faculty" value="faculty" />
                    <div>
                      <Label htmlFor="faculty" className="font-medium">Faculty</Label>
                      <p className="text-sm text-gray-500">Educator, Professor or Academic Staff</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem id="other" value="other" />
                    <div>
                      <Label htmlFor="other" className="font-medium">Other</Label>
                      <p className="text-sm text-gray-500">Any other role or capacity</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div 
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
          >
            <div className="space-y-6">
              {/* Student specific fields */}
              {formData.mainUserType === "student" && (
                <>
                  <div>
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => handleInputChange("institution", e.target.value)}
                      placeholder="Your institute or university name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="highestEducation">Highest Education</Label>
                    <Input
                      id="highestEducation"
                      value={formData.highestEducation}
                      onChange={(e) => handleInputChange("highestEducation", e.target.value)}
                      placeholder="Your highest education qualification"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      value={formData.courseName}
                      onChange={(e) => handleInputChange("courseName", e.target.value)}
                      placeholder="Your course or program name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="courseStatus">Course Status</Label>
                    <select
                      id="courseStatus"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                      value={formData.courseStatus}
                      onChange={(e) => handleInputChange("courseStatus", e.target.value)}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Mentor specific fields */}
              {formData.mainUserType === "mentor" && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <Label htmlFor="mentorType" className="text-base font-medium">Select your expertise area *</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose the type of expertise you&apos;ll bring to the ODR Lab community
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {mentorTypes.map(type => (
                        <div 
                          key={type.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.mentorType === type.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleInputChange("mentorType", type.value)}
                        >
                          <div className="flex items-start">
                            <div className={`w-4 h-4 rounded-full mt-1 mr-2 ${
                              formData.mentorType === type.value 
                                ? 'bg-blue-500' 
                                : 'border border-gray-300'
                            }`}/>
                            <div>
                              <h3 className="font-medium">{type.label}</h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Render fields based on selected mentor type */}
                  {formData.mentorType && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 border-t pt-6"
                    >
                      <h3 className="text-lg font-medium mb-4">
                        {mentorTypes.find(t => t.value === formData.mentorType)?.label} Details
                      </h3>
                      
                      {/* Tech mentor fields */}
                      {formData.mentorType === "tech" && (
                        <>
                          <div className="mb-4">
                            <Label htmlFor="techOrg">Organization/Company *</Label>
                            <Input
                              id="techOrg"
                              value={formData.techOrg}
                              onChange={(e) => handleInputChange("techOrg", e.target.value)}
                              placeholder="Your organization or company name"
                              className="mt-1"
                            />
                          </div>
                          <div className="mb-4">
                            <Label htmlFor="role">Role/Position *</Label>
                            <Input
                              id="role"
                              value={formData.role}
                              onChange={(e) => handleInputChange("role", e.target.value)}
                              placeholder="Your role (e.g., Software Engineer, Tech Lead)"
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Legal mentor fields */}
                      {formData.mentorType === "law" && (
                        <>
                          <div className="mb-4">
                            <Label htmlFor="lawFirm">Law Firm/Organization *</Label>
                            <Input
                              id="lawFirm"
                              value={formData.lawFirm}
                              onChange={(e) => handleInputChange("lawFirm", e.target.value)}
                              placeholder="Your law firm or organization name"
                              className="mt-1"
                            />
                          </div>
                          <div className="mb-4">
                            <Label htmlFor="role">Legal Role *</Label>
                            <Input
                              id="role"
                              value={formData.role}
                              onChange={(e) => handleInputChange("role", e.target.value)}
                              placeholder="Your legal role (e.g., Attorney, Legal Advisor)"
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* ODR or Conflict Resolution mentor fields */}
                      {(formData.mentorType === "odr" || formData.mentorType === "conflict") && (
                        <>
                          <div className="mb-4">
                            <Label htmlFor="organization">Organization *</Label>
                            <Input
                              id="organization"
                              value={formData.organization}
                              onChange={(e) => handleInputChange("organization", e.target.value)}
                              placeholder="Your organization"
                              className="mt-1"
                            />
                          </div>
                          <div className="mb-4">
                            <Label htmlFor="role">Role/Position *</Label>
                            <Input
                              id="role"
                              value={formData.role}
                              onChange={(e) => handleInputChange("role", e.target.value)}
                              placeholder="Your role (e.g., Software Engineer, Tech Lead)"
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Common for all mentor types */}
                      <div>
                        <Label htmlFor="expertise">Areas of Expertise *</Label>
                        <Textarea
                          id="expertise"
                          value={formData.expertise}
                          onChange={(e) => handleInputChange("expertise", e.target.value)}
                          placeholder="Please describe your technical expertise, mentoring experience, and how you plan to guide student innovators in ODR Lab."
                          rows={3}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This helps us match you with appropriate innovation projects
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {/* Faculty specific fields */}
              {formData.mainUserType === "faculty" && (
                <>
                  <div>
                    <Label htmlFor="facultyInstitute">Institution *</Label>
                    <Input
                      id="facultyInstitute"
                      value={formData.facultyInstitute}
                      onChange={(e) => handleInputChange("facultyInstitute", e.target.value)}
                      placeholder="Your institute or university name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyRole">Faculty Role</Label>
                    <Input
                      id="facultyRole"
                      value={formData.facultyRole}
                      onChange={(e) => handleInputChange("facultyRole", e.target.value)}
                      placeholder="Professor, Associate Professor, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyExpertise">Areas of Expertise</Label>
                    <Textarea
                      id="facultyExpertise"
                      value={formData.facultyExpertise}
                      onChange={(e) => handleInputChange("facultyExpertise", e.target.value)}
                      placeholder="Your areas of expertise"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyCourse">Course(s) Taught</Label>
                    <Input
                      id="facultyCourse"
                      value={formData.facultyCourse}
                      onChange={(e) => handleInputChange("facultyCourse", e.target.value)}
                      placeholder="Courses you teach"
                    />
                  </div>
                </>
              )}
              
              {/* Other specific fields */}
              {formData.mainUserType === "other" && (
                <>
                  <div>
                    <Label htmlFor="workplace">Workplace/Organization</Label>
                    <Input
                      id="workplace"
                      value={formData.workplace}
                      onChange={(e) => handleInputChange("workplace", e.target.value)}
                      placeholder="Your organization or company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherRole">Role/Position</Label>
                    <Input
                      id="otherRole"
                      value={formData.otherRole}
                      onChange={(e) => handleInputChange("otherRole", e.target.value)}
                      placeholder="Your role (e.g., Software Engineer, Tech Lead)"
                    />
                  </div>
                </>
              )}
              
              {/* Common fields for all user types */}
              <div>
                <Label htmlFor="description">How do you plan to use ODR Lab?</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Tell us about your interests and expertise and how you plan to contribute..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div 
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
          >
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-4">Review Your Information</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Name:</span>
                    <span className="col-span-2">{userDisplayData.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="col-span-2">{userDisplayData.email}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Contact:</span>
                    <span className="col-span-2">{formData.contactNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Location:</span>
                    <span className="col-span-2">{formData.city}, {formData.country}</span>
                  </div>
                  {/* User Type Display - with appropriate styling based on type */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <span className="font-medium">Role Type:</span>
                    <span className={`col-span-2 font-medium ${
                      formData.mainUserType === "mentor" 
                        ? 'text-blue-600' 
                        : formData.mainUserType === "student"
                        ? 'text-green-600'
                        : formData.mainUserType === "faculty"
                        ? 'text-purple-600'
                        : 'text-gray-600'
                    }`}>
                      {formData.mainUserType && formData.mainUserType.charAt(0).toUpperCase() + formData.mainUserType.slice(1)}
                    </span>
                  </div>
                  
                  {/* Mentor Type - only shown for mentors */}
                  {formData.mainUserType === "mentor" && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <span className="font-medium">Expertise:</span>
                      <span className="col-span-2">
                        {mentorTypes.find(t => t.value === formData.mentorType)?.label || formData.mentorType}
                      </span>
                    </div>
                  )}
                  
                  {/* Student-specific fields */}
                  {formData.mainUserType === "student" && (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Institution:</span>
                        <span className="col-span-2">{formData.institution}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Education:</span>
                        <span className="col-span-2">{formData.highestEducation}</span>
                      </div>
                      {formData.courseName && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <span className="font-medium">Course:</span>
                          <span className="col-span-2">
                            {formData.courseName} ({formData.courseStatus || 'In Progress'})
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Mentor-specific fields with context-aware display */}
                  {formData.mainUserType === "mentor" && (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Organization:</span>
                        <span className="col-span-2">
                          {formData.mentorType === "tech" ? formData.techOrg : 
                           formData.mentorType === "law" ? formData.lawFirm : 
                           formData.organization}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Role:</span>
                        <span className="col-span-2">{formData.role}</span>
                      </div>
                      {formData.expertise && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <span className="font-medium">Expertise:</span>
                          <span className="col-span-2">{formData.expertise}</span>
                        </div>
                      )}
                      <div className="mt-2 bg-blue-50 p-2 rounded-md text-xs text-blue-600 italic">
                        Note: Your mentor account will need approval from administrators before you can provide mentorship.
                      </div>
                    </>
                  )}
                  
                  {/* Faculty-specific fields */}
                  {formData.mainUserType === "faculty" && (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Institution:</span>
                        <span className="col-span-2">{formData.facultyInstitute}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Faculty Role:</span>
                        <span className="col-span-2">{formData.facultyRole}</span>
                      </div>
                      {formData.facultyExpertise && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <span className="font-medium">Expertise:</span>
                          <span className="col-span-2">{formData.facultyExpertise}</span>
                        </div>
                      )}
                      {formData.facultyCourse && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <span className="font-medium">Course(s):</span>
                          <span className="col-span-2">{formData.facultyCourse}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Other user type fields */}
                  {formData.mainUserType === "other" && (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Workplace:</span>
                        <span className="col-span-2">{formData.workplace}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <span className="font-medium">Role:</span>
                        <span className="col-span-2">{formData.otherRole}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
                <p className="text-gray-600 text-sm">
                Please review your information above. If everything looks correct, click &quot;Complete Profile&quot; to finish setting up your account.
                </p>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Completing Profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Profile</CardTitle>
            <p className="text-gray-600">Please provide additional information to complete your registration</p>
          </CardHeader>
          
          <CardContent>
            {/* User Info Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{userDisplayData.name}</span>
              </div>
              <p className="text-sm text-gray-600">{userDisplayData.email}</p>
              {userDisplayData.image && (
                <img 
                  src={userDisplayData.image} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full mt-2"
                />
              )}
            </div>
            
            {/* Step indicator */}
            {renderStepIndicator()}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {renderFormStep()}
              </AnimatePresence>
              
              {/* Navigation buttons */}
              {step !== 3 && (
                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={step === 0}
                    className={step === 0 ? "invisible" : ""}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      <CompleteProfileClient />
    </Suspense>
  );
}