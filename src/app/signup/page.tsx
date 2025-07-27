"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; 
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { initializeGoogleAuth } from "@/lib/google-auth";
import { GoogleUser } from "@/types/auth";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1], // Fast easing function
      when: "beforeChildren",
      staggerChildren: 0.05
    },
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

const mentorTypes = [
  { value: "tech", label: "Technical Expert" },
  { value: "law", label: "Legal Expert" },
  { value: "odr", label: "ODR Expert" },
  { value: "conflict", label: "Conflict Resolution Expert" }
];



const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobile: "",
  city: "",
  country: "",
  userType: "",
  // Student
  highestEducation: "",
  studentInstitute: "",
  courseStatus: "",
  courseName: "",
  odrLabPurpose: "",
  // Faculty
  facultyInstitute: "",
  facultyRole: "",
  facultyExpertise: "",
  facultyCourse: "",
  facultyMentor: "",
  // Tech Enthusiast
  techOrg: "",
  techRole: "",
  odrLabUsageDescription:"",
  // Law Enthusiast
  lawFirm: "",
  // Other
  mainUserType: "", // For initial selection
  mentorType: "", // For mentor subtype selection
  // Other user types
  otherRole: "",
  otherWorkplace: "",
};

const steps = ["Basic Info", "User Type", "Details", "Review"];

const SignUpPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();

  // Google Sign-In: load script and render button, handle callback
  useEffect(() => {
    // Dynamically load Google script if not present
    let script: HTMLScriptElement | null = null;
    if (typeof window !== "undefined" && !window.google) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => setGoogleScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setGoogleScriptLoaded(true);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!googleScriptLoaded) return;

    if (window.google && window.google.accounts && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          // Decode the JWT credential from Google
          const credential = response.credential;
          if (!credential) return;

          // Decode JWT to get user info (email, name, picture)
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          );
          const payload = JSON.parse(jsonPayload);

          // Send user info to backend for sign-in/up
          try {
            setLoading(true);
            setError(null);
            const res = await apiFetch(
              "/auth/google-signin",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture,
                }),
                credentials: 'include',
              }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Google sign-up failed");

           if (data.user) {
             login(data.user);
             // Check if user has complete profile info before redirecting to home
             if (data.user.contactNumber && data.user.city && data.user.country) {
               router.push("/home");
             } else {
               // If incomplete profile, redirect to complete profile with user info
               const params = new URLSearchParams({
                 email: data.user.email,
                 name: data.user.name,
                 image: payload.picture || "",
                 fromGoogle: "true"
               });
               router.push(`/complete-profile?${params.toString()}`);
             }
           } else if (data.needsProfileCompletion) {
              const params = new URLSearchParams({
                email: payload.email,
                name: payload.name,
                image: payload.picture || "",
                fromGoogle: "true"
              });
              router.push(`/complete-profile?${params.toString()}`);
            } else {
              console.log("Unexpected Google sign-in response, redirecting to landing");
              router.push("/");
            }
          } catch (err: any) {
            setError(err.message || "Google sign-up failed");
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: googleButtonRef.current.offsetWidth,
        text: "signup_with",
      });

      // Optionally show One Tap
      window.google.accounts.id.prompt();
    }
  }, [googleScriptLoaded, login, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const name = target.name;
    let value: string | boolean = target.value;
    if (
      target instanceof HTMLInputElement &&
      (target.type === "checkbox" || target.type === "radio")
    ) {
      value = target.checked ? target.value : "";
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setError(null);
    // Basic validation for each step
    if (step === 0) {
      if (
        !form.name ||
        !form.email ||
        !form.mobile ||
        !form.city ||
        !form.country ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("Please fill all required fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
    }
    if (step === 1) {
      if (!form.mainUserType) {
        setError("Please select whether you're a Student Innovator or Mentor.");
        return;
      }
      
      // Set the userType based on mainUserType and mentorType for backend compatibility
      if (form.mainUserType === "innovator") {
        // For student innovators, keep as student
        setForm(prev => ({ ...prev, userType: "student" }));
      } else if (form.mainUserType === "mentor") {
        // For mentors, validate that a mentor type is selected
        if (!form.mentorType) {
          setError("Please select your mentor type.");
          return;
        }
        // Set userType based on mentorType
        setForm(prev => ({ ...prev, userType: prev.mentorType }));
      } else {
        // For faculty and others, use the mainUserType directly
        setForm(prev => ({ ...prev, userType: prev.mainUserType }));
      }
    }
    if (step === 2) {
      // Per userType validation
      if (form.userType === "student") {
        if (
          !form.highestEducation ||
          !form.studentInstitute ||
          !form.courseStatus ||
          !form.courseName
        ) {
          setError("Please fill all required student fields.");
          return;
        }
      }
      if (form.userType === "faculty") {
        if (
          !form.facultyInstitute ||
          !form.facultyRole ||
          !form.facultyExpertise ||
          !form.facultyCourse ||
          !form.facultyMentor
        ) {
          setError("Please fill all required faculty fields.");
          return;
        }
      }
      if (form.userType === "tech") {
        if (!form.techOrg || !form.techRole) {
          setError("Please fill all required tech enthusiast fields.");
          return;
        }
      }
      if (form.userType === "law") {
        if (!form.lawFirm) {
          setError("Please fill all required law enthusiast fields.");
          return;
        }
      }
      if (form.userType === "odr") {
        if (!form.otherWorkplace || !form.highestEducation) {
          setError("Please fill all required ODR expert fields.");
          return;
        }
      }
      if (form.userType === "conflict") {
        if (!form.otherWorkplace || !form.highestEducation) {
          setError("Please fill all required conflict resolution expert fields.");
          return;
        }
      }
      if (form.userType === "other") {
        if (!form.otherRole || !form.otherWorkplace) {
          setError("Please fill all required fields for Other.");
          return;
        }
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Construct ODR Lab usage string based on user type
    let odrLabUsageDescription = "";

    switch (form.userType) {
      case "student":
        odrLabUsageDescription = `As a student of ${form.courseName} (${
          form.courseStatus
        }) at ${form.studentInstitute}. ${form.odrLabPurpose || ""}`;
        break;
      case "faculty":
        odrLabUsageDescription = `As a ${form.facultyRole} at ${
          form.facultyInstitute
        }, specializing in ${form.facultyExpertise}, teaching ${
          form.facultyCourse
        }. ${form.odrLabPurpose || ""}`;
        break;
      case "tech":
        odrLabUsageDescription = `As a ${form.techRole} at ${form.techOrg}. ${
          form.odrLabUsageDescription || ""
        }`;
        break;
      case "law":
        odrLabUsageDescription = `As a legal professional at ${form.lawFirm}. ${
          form.odrLabPurpose || ""
        }`;
        break;
      case "other":
        odrLabUsageDescription = `As a ${form.otherRole} at ${
          form.otherWorkplace
        }. ${form.odrLabPurpose || ""}`;
        break;
      case "odr":
        odrLabUsageDescription = `${form.otherWorkplace}. ${form.odrLabPurpose || ""}`; 
        break;
      case "conflict":
        odrLabUsageDescription = `${form.otherWorkplace}. ${form.odrLabPurpose || ""}`;
        break;
      
      default:
        odrLabUsageDescription = form.odrLabPurpose || "";
    }

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          // Basic user info
          name: form.name,
          email: form.email,
          password: form.password,
          contactNumber: form.mobile,
          city: form.city,
          country: form.country,
          userRole:
            form.userType === "student"
              ? "INNOVATOR"
              : form.userType === "faculty"
              ? "FACULTY" // Changed from OTHER to FACULTY for clarity
              : form.userType === "law" || form.userType === "tech" || 
                form.userType === "odr" || form.userType === "conflict"
              ? "MENTOR" // All mentor types get MENTOR role but with pending approval
              : "OTHER",
          // Add mentorApproved flag to signal approval status for new mentors
          mentorApproved: false, // Will be false for new mentor signups
          mentorType: form.mentorType || undefined, // Store the specific mentor type
          institution:
            form.studentInstitute ||
            form.facultyInstitute ||
            form.techOrg ||
            form.lawFirm ||
            form.otherWorkplace ||
            undefined,
          highestEducation: form.highestEducation || undefined,
          odrLabUsage: odrLabUsageDescription,
          
          // Include all form fields for detailed metadata storage
          // Student fields
          studentInstitute: form.studentInstitute,
          courseStatus: form.courseStatus,
          courseName: form.courseName,
          
          // Faculty fields
          facultyInstitute: form.facultyInstitute,
          facultyRole: form.facultyRole,
          facultyExpertise: form.facultyExpertise,
          facultyCourse: form.facultyCourse,
          facultyMentor: form.facultyMentor,
          
          // Tech mentor fields
          techOrg: form.techOrg,
          techRole: form.techRole,
          
          // Law mentor fields
          lawFirm: form.lawFirm,
          
          // Other fields
          otherRole: form.otherRole,
          otherWorkplace: form.otherWorkplace,
          
          // Selected user types
          mainUserType: form.mainUserType,
          userType: form.userType,
          
          // Purpose and additional info
          odrLabPurpose: form.odrLabPurpose
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful!");
        if (login && data.user) {
          login(data.user);
        }
        setTimeout(() => {
          router.push("/home");
        }, 3000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="space-y-6">
            <motion.div variants={fadeInUp}>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={fadeInUp}>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Your mobile number"
                required
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={fadeInUp}>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Your country"
                  required
                />
              </div>
            </motion.div>
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
            className="space-y-6">
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-medium text-center text-[#0a1e42] mb-6">How would you like to join ODR Lab?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Student Innovator Option */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className={`border p-5 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    form.mainUserType === "innovator"
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({ 
                      ...prev, 
                      mainUserType: "innovator",
                      mentorType: "" // Reset mentor type when switching
                    }))
                  }>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-blue-800">Student Innovator</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Join as an Ideator and collaborate using ODR Lab to design and develop innovative ODR systems.
                    </p>
                  </div>
                </motion.div>
                
                {/* Mentor Option */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className={`border p-5 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    form.mainUserType === "mentor"
                      ? "bg-purple-50 border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-300 hover:border-purple-300"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, mainUserType: "mentor" }))
                  }>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-purple-800">Mentor</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Join as a mentor to guide and support student innovations
                    </p>
                  </div>
                </motion.div>
                
                {/* Faculty Option */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className={`border p-5 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    form.mainUserType === "faculty"
                      ? "bg-teal-50 border-teal-500 ring-2 ring-teal-200"
                      : "border-gray-300 hover:border-teal-300"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({ 
                      ...prev, 
                      mainUserType: "faculty",
                      mentorType: "" // Reset mentor type when switching
                    }))
                  }>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-teal-800">Faculty</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Join as faculty to integrate ODR Lab into your teaching
                    </p>
                  </div>
                </motion.div>
                
                {/* Other Option */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className={`border p-5 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    form.mainUserType === "other"
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-200"
                      : "border-gray-300 hover:border-amber-300"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({ 
                      ...prev, 
                      mainUserType: "other",
                      mentorType: "" // Reset mentor type when switching
                    }))
                  }>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-amber-800">Other</div>
                    <p className="text-sm text-gray-600 mt-2">
                     Join to discover innovative ODR ideas and stay inspired by the latest advancements.
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Show mentor type selection only if mentor is selected */}
              {form.mainUserType === "mentor" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-indigo-800 mb-4">Please select your mentor type:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentorTypes.map((type) => (
                        <motion.div
                        key={type.value}
                        variants={fadeInUp}
                        initial={{ opacity: 1, y: 0 }} // Start visible immediately
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1 }} // Very fast transition
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 p-4 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                          form.mentorType === type.value
                          ? type.value === "tech" 
                            ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300" 
                            : type.value === "law" 
                            ? "bg-amber-100 border-amber-500 ring-2 ring-amber-300"
                            : type.value === "odr" 
                            ? "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300"
                            : "bg-purple-100 border-purple-500 ring-2 ring-purple-300"
                          : "border-gray-300 hover:border-indigo-300"
                        }`}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, mentorType: type.value }))
                        }>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="font-medium">
                          
                          <div className={`text-lg mb-2 font-bold ${
                            type.value === "tech" ? "text-blue-700" : 
                            type.value === "law" ? "text-amber-700" :
                            type.value === "odr" ? "text-emerald-700" :
                            "text-purple-700"
                          }`}>
                            {type.label}
                          </div>
                          
                          {type.value === "tech" && (
                            <motion.p 
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="text-sm text-gray-600 mt-1">
                              For technical professionals who can guide innovative tech projects
                            </motion.p>
                          )}
                          {type.value === "law" && (
                            <motion.p 
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="text-sm text-gray-600 mt-1">
                              For legal professionals who can provide expertise on regulatory aspects
                            </motion.p>
                          )}
                          {type.value === "odr" && (
                            <motion.p 
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="text-sm text-gray-600 mt-1">
                              For professionals specialized in Online Dispute Resolution systems
                            </motion.p>
                          )}
                          {type.value === "conflict" && (
                            <motion.p 
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="text-sm text-gray-600 mt-1">
                              For professionals with expertise in conflict management techniques
                            </motion.p>
                          )}
                        
                        </motion.div>
                  </motion.div>  
                    ))}    
                  </div>      
                </motion.div>
              )}
            </motion.div>
          </motion.div>
      );
    
      // the info step 
      case 2:
        return (
          <motion.div
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="space-y-6">
            {/* Render fields based on user type */}
            {form.userType === "student" && (
                <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-6">
                  <h3 className="text-lg font-medium text-blue-800 mb-4">Student Innovator Information</h3>
                  <p className="text-sm text-gray-600 mb-6">Please provide your academic details to help us customize your experience</p>
                  
                  <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="highestEducation" className="text-blue-700">Highest Education</Label>
                    <Input
                    id="highestEducation"
                    name="highestEducation"
                    value={form.highestEducation}
                    onChange={handleChange}
                    placeholder="Your highest education qualification"
                    className="mt-1"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentInstitute" className="text-blue-700">Institute</Label>
                    <Input
                    id="studentInstitute"
                    name="studentInstitute"
                    value={form.studentInstitute}
                    onChange={handleChange}
                    placeholder="Your institute or university name"
                    className="mt-1"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseName" className="text-blue-700">Course/Program Name</Label>
                    <Input
                    id="courseName"
                    name="courseName"
                    value={form.courseName}
                    onChange={handleChange}
                    placeholder="Your course or program name"
                    className="mt-1"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseStatus" className="text-blue-700">Course Status</Label>
                    <select
                    id="courseStatus"
                    name="courseStatus"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    value={form.courseStatus}
                    onChange={handleChange}
                    required>
                    <option value="">Select status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="odrLabPurpose" className="text-blue-700">
                    Purpose for joining ODR Lab
                    </Label>
                    <Textarea
                    id="odrLabPurpose"
                    name="odrLabPurpose"
                    value={form.odrLabPurpose}
                    onChange={handleChange}
                    placeholder="Why do you want to join the ODR Lab? What are your innovation goals? How will this platform help your academic or personal growth?"
                    rows={6}
                    className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                    Your response helps us understand your goals and how we can better support your innovation journey.
                    </p>
                  </div>
                  </div>
                </motion.div>
                </motion.div>
            )}
            {/* Faculty Mentor */}
            {form.userType === "faculty" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div
                  className="space-y-4"
                  variants={fadeInUp}>
                  <div>
                    <Label htmlFor="facultyInstitute">Institution</Label>
                    <Input
                      id="facultyInstitute"
                      name="facultyInstitute"
                      value={form.facultyInstitute}
                      onChange={handleChange}
                      placeholder="Your institution name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyRole">Role</Label>
                    <Input
                      id="facultyRole"
                      name="facultyRole"
                      value={form.facultyRole}
                      onChange={handleChange}
                      placeholder="Your role (e.g., Professor, Associate Professor)"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyExpertise">Area of Expertise</Label>
                    <Input
                      id="facultyExpertise"
                      name="facultyExpertise"
                      value={form.facultyExpertise}
                      onChange={handleChange}
                      placeholder="Your area of expertise"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyCourse">Course you teach</Label>
                    <Input
                      id="facultyCourse"
                      name="facultyCourse"
                      value={form.facultyCourse}
                      onChange={handleChange}
                      placeholder="Course you teach"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyMentor">
                      Are you willing to mentor students?
                    </Label>
                    <select
                      id="facultyMentor"
                      name="facultyMentor"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0a1e42]"
                      value={form.facultyMentor}
                      onChange={handleChange}
                      required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="odrLabPurpose">
                      How do you plan to use ODR Lab?
                    </Label>
                    <Textarea
                      id="odrLabPurpose"
                      name="odrLabPurpose"
                      value={form.odrLabPurpose}
                      onChange={handleChange}
                      placeholder="How will you use ODR Lab in your teaching or research?"
                      rows={4}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Tech Enthusiast Mentor */}
            {form.userType === "tech" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-6">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">Technical Expert Mentor</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    As a technical mentor, you will guide students in developing innovative technology solutions.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="techOrg" className="text-indigo-700">Organization/Company</Label>
                      <Input
                        id="techOrg"
                        name="techOrg"
                        value={form.techOrg}
                        onChange={handleChange}
                        placeholder="Your organization or company name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="techRole" className="text-indigo-700">Professional Role</Label>
                      <Input
                        id="techRole"
                        name="techRole"
                        value={form.techRole}
                        onChange={handleChange}
                        placeholder="Your role (e.g., Software Engineer, Tech Lead)"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="highestEducation" className="text-indigo-700">Highest Education</Label>
                      <Input
                        id="highestEducation"
                        name="highestEducation"
                        value={form.highestEducation}
                        onChange={handleChange}
                        placeholder="Your highest education qualification"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="odrLabUsageDescription" className="text-indigo-700">
                        Share Your Expertise and Mentoring Approach
                      </Label>
                      <Textarea
                        id="odrLabUsageDescription"
                        name="odrLabUsageDescription"
                        value={form.odrLabUsageDescription}
                        onChange={handleChange}
                        placeholder="Please describe your technical expertise, mentoring experience, and how you plan to guide student innovators through the ODR Lab."
                        rows={6}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Your mentorship will be invaluable in helping students develop effective technological solutions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Law Enthusiast Mentor */}
            {form.userType === "law" && (
                <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-6">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">Law Enthusiast Mentor</h3>
                  <p className="text-sm text-gray-600 mb-6">
                  As a legal mentor, you&apos;ll provide guidance on legal and regulatory aspects of student innovations.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="lawFirm" className="text-indigo-700">Law Firm/Organization</Label>
                    <Input
                    id="lawFirm"
                    name="lawFirm"
                    value={form.lawFirm}
                    onChange={handleChange}
                    placeholder="Your law firm or organization name"
                    className="mt-1"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="highestEducation" className="text-indigo-700">Legal Education</Label>
                    <Input
                    id="highestEducation"
                    name="highestEducation"
                    value={form.highestEducation}
                    onChange={handleChange}
                    placeholder="Your legal education (e.g., LLB, JD)"
                    className="mt-1"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="odrLabPurpose" className="text-indigo-700">
                    Legal Expertise & Mentoring Approach
                    </Label>
                    <Textarea
                    id="odrLabPurpose"
                    name="odrLabPurpose"
                    value={form.odrLabPurpose}
                    onChange={handleChange}
                    placeholder="Share your expertise which can benefit student innovators in ODR Lab"
                    rows={6}
                    className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                    Your legal expertise will be invaluable in guiding students through complex regulatory landscapes.
                    </p>
                  </div>
                  </div>
                </motion.div>
                </motion.div>
            )}

            {/* ODR Expert Mentor */}
            {form.userType === "odr" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-6">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">ODR Expert Mentor</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    As an ODR expert, you&apos;ll guide students in understanding and implementing online dispute resolution systems.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otherWorkplace" className="text-indigo-700">Organization/Institution</Label>
                      <Input
                        id="otherWorkplace"
                        name="otherWorkplace"
                        value={form.otherWorkplace}
                        onChange={handleChange}
                        placeholder="Your organization or institution name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="highestEducation" className="text-indigo-700">Highest Education</Label>
                      <Input
                        id="highestEducation"
                        name="highestEducation"
                        value={form.highestEducation}
                        onChange={handleChange}
                        placeholder="Your highest education qualification"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="odrLabPurpose" className="text-indigo-700">
                        ODR Expertise & Mentoring Approach
                      </Label>
                      <Textarea
                        id="odrLabPurpose"
                        name="odrLabPurpose"
                        value={form.odrLabPurpose}
                        onChange={handleChange}
                        placeholder="Share your expertise which can benefit student innovators in ODR Lab"
                        rows={4}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Conflict Resolution Expert Mentor */}
            {form.userType === "conflict" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-6">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">Conflict Resolution Expert Mentor</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    As a conflict resolution expert, you will guide students in understanding effective dispute management and resolution techniques.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otherWorkplace" className="text-indigo-700">Organization/Institution</Label>
                      <Input
                        id="otherWorkplace"
                        name="otherWorkplace"
                        value={form.otherWorkplace}
                        onChange={handleChange}
                        placeholder="Your organization or institution name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="highestEducation" className="text-indigo-700">Highest Education</Label>
                      <Input
                        id="highestEducation"
                        name="highestEducation"
                        value={form.highestEducation}
                        onChange={handleChange}
                        placeholder="Your highest education qualification"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="odrLabPurpose" className="text-indigo-700">
                        Conflict Resolution Expertise & Mentoring Approach
                      </Label>
                      <Textarea
                        id="odrLabPurpose"
                        name="odrLabPurpose"
                        value={form.odrLabPurpose}
                        onChange={handleChange}
                        placeholder="Share your expertise which can benefit student innovators in ODR Lab"
                        rows={4}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            {/*  other type */}
            {form.userType === "other" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}>
                <motion.div
                  className="space-y-4"
                  variants={fadeInUp}>
                  <div>
                    <Label htmlFor="otherRole">Your Role</Label>
                    <Input
                      id="otherRole"
                      name="otherRole"
                      value={form.otherRole}
                      onChange={handleChange}
                      placeholder="Your current role"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherWorkplace">
                      Workplace/Institution
                    </Label>
                    <Input
                      id="otherWorkplace"
                      name="otherWorkplace"
                      value={form.otherWorkplace}
                      onChange={handleChange}
                      placeholder="Your workplace or institution"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="highestEducation">Highest Education</Label>
                    <Input
                      id="highestEducation"
                      name="highestEducation"
                      value={form.highestEducation}
                      onChange={handleChange}
                      placeholder="Your highest education"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="odrLabPurpose">
                      How do you plan to use ODR Lab?
                    </Label>
                    <Textarea
                      id="odrLabPurpose"
                      name="odrLabPurpose"
                      value={form.odrLabPurpose}
                      onChange={handleChange}
                      placeholder="How will you use ODR Lab?"
                      rows={4}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        );
        // the review step
      case 3:
        return (
          <motion.div
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="space-y-6">
            <motion.div
              className="space-y-4"
              variants={fadeInUp}>
              <h3 className="text-lg font-medium text-[#0a1e42]">Review Your Information</h3>
              <p className="text-sm text-gray-600">Please verify all the details before submitting your registration</p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 max-h-[400px] overflow-y-auto">
                <div className="grid gap-3">
                  {/* Personal Information Section */}
                  <h4 className="font-medium text-[#0a1e42] border-b pb-1">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-sm text-gray-700">Name:</span> 
                      <p className="text-gray-900">{form.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">Email:</span> 
                      <p className="text-gray-900">{form.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">Mobile:</span> 
                      <p className="text-gray-900">{form.mobile}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">Location:</span> 
                      <p className="text-gray-900">{form.city}, {form.country}</p>
                    </div>
                  </div>

                  {/* User Type Information */}
                  <h4 className="font-medium text-[#0a1e42] border-b pb-1 mt-3">
                    User Role
                  </h4>
                  <div>
                    <span className="font-medium text-sm text-gray-700">Primary Role:</span>{" "}
                    <p className="text-gray-900">
                      {form.mainUserType === "innovator" 
                        ? "Student Innovator"
                        : form.mainUserType === "mentor"
                        ? "Mentor"
                        : form.mainUserType === "faculty"
                        ? "Faculty"
                        : "Other"
                      }
                    </p>
                  </div>

                  {form.mainUserType === "mentor" && (
                    <div>
                      <span className="font-medium text-sm text-gray-700">Mentor Type:</span>{" "}
                      <p className="text-gray-900">
                        {form.mentorType === "tech" ? "Technical Expert" : 
                         form.mentorType === "law" ? "Legal Expert" : 
                         form.mentorType === "odr" ? "ODR Expert" : 
                         form.mentorType === "conflict" ? "Conflict Resolution Expert" : ""}
                      </p>
                    </div>
                  )}

                  {/* Professional Information Section */}
                  <h4 className="font-medium text-[#0a1e42] border-b pb-1 mt-3">
                    Professional Information
                  </h4>

                  {/* Student Fields */}
                  {form.userType === "student" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Highest Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Institution:</span>{" "}
                        <p className="text-gray-900">{form.studentInstitute}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Course Name:</span>{" "}
                        <p className="text-gray-900">{form.courseName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Course Status:</span>{" "}
                        <p className="text-gray-900">{form.courseStatus}</p>
                      </div>
                    </div>
                  )}

                  {/* Faculty Fields */}
                  {form.userType === "faculty" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Institution:</span>{" "}
                        <p className="text-gray-900">{form.facultyInstitute}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Role:</span>{" "}
                        <p className="text-gray-900">{form.facultyRole}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Area of Expertise:</span>{" "}
                        <p className="text-gray-900">{form.facultyExpertise}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Course:</span>{" "}
                        <p className="text-gray-900">{form.facultyCourse}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Willing to Mentor:</span>{" "}
                        <p className="text-gray-900">{form.facultyMentor === "yes" ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  )}

                  {/* Tech Mentor Fields */}
                  {form.userType === "tech" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Organization:</span>{" "}
                        <p className="text-gray-900">{form.techOrg}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Role:</span>{" "}
                        <p className="text-gray-900">{form.techRole}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Highest Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                    </div>
                  )}

                  {/* Law Mentor Fields */}
                  {form.userType === "law" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Law Firm/Organization:</span>{" "}
                        <p className="text-gray-900">{form.lawFirm}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Legal Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                    </div>
                  )}

                  {/* ODR Expert Fields */}
                  {form.userType === "odr" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Organization/Institution:</span>{" "}
                        <p className="text-gray-900">{form.otherWorkplace}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Highest Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                    </div>
                  )}

                  {/* Conflict Resolution Expert Fields */}
                  {form.userType === "conflict" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Organization/Institution:</span>{" "}
                        <p className="text-gray-900">{form.otherWorkplace}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Highest Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                    </div>
                  )}

                  {/* Other User Fields */}
                  {form.userType === "other" && (
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-700">Role:</span>{" "}
                        <p className="text-gray-900">{form.otherRole}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Workplace/Institution:</span>{" "}
                        <p className="text-gray-900">{form.otherWorkplace}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-700">Highest Education:</span>{" "}
                        <p className="text-gray-900">{form.highestEducation}</p>
                      </div>
                    </div>
                  )}

                  {/* ODR Lab Usage Section */}
                  <h4 className="font-medium text-[#0a1e42] border-b pb-1 mt-3">
                    ODR Lab Usage
                  </h4>
                  <div>
                    <span className="font-medium text-sm text-gray-700">Purpose for joining ODR Lab:</span>
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-white rounded border border-gray-100">
                      {form.odrLabPurpose || form.odrLabUsageDescription || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Please carefully review your information above before submitting. Once submitted, you&apos;ll be able to update your profile later.</p>
              </div> */}
            </motion.div>
          </motion.div>
      )
      default:
        return null;
    };
  }

return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-900 p-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {/* Background animation elements */}
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-500/10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-sky-400/10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
        {success ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-[#0a1e42] mb-4">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering. You will be redirected to the homepage shortly...
            </p>
          </motion.div>
        ) : (
          <>
            <motion.h1
              className="text-2xl font-bold mb-2 text-center text-[#0a1e42]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              Create Your Account
            </motion.h1>

            {step === 0 && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                {/* Google Sign In Button Container - with ref */}
                <div 
                  id="google-signin-container" 
                  ref={googleButtonRef}
                  className="w-full h-12 flex justify-center"
                >
                  {/* Google button will be rendered here by the Google API */}
                  {!googleScriptLoaded && (
                    <Button
                      type="button"
                      disabled={loading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium transition-all duration-200 flex items-center justify-center space-x-3 ">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign up with Google</span>
                    </Button>
                  )}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or create account with email</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="mb-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}>
              <div className="flex items-center w-full max-w-md">
                {steps.map((stepName, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          i <= step
                            ? "bg-[#0a1e42] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                        {i + 1}
                      </div>
                      <span className="text-xs mt-1">{stepName}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-1 ${
                          i < step ? "bg-[#0a1e42]" : "bg-gray-200"
                        }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-6">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {/* here is where the middle forms come into the picture.*/}
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            {/* back button  */}
            <motion.div
              className="flex justify-between mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}>
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="px-4">
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              {/* next button */}
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#0a1e42] hover:bg-[#162d5a] px-4">
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSignUp}
                  className="bg-[#0a1e42] hover:bg-[#162d5a] px-4"
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
                      Registering...
                    </motion.span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </motion.div>
              {/* main account signup form common for all users. the bottom part of the main form  */}
            {step === 0 && (
              <motion.div
                className="mt-6 text-center text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                <span>Already have an account? </span>
                <Link
                  href="/signin"
                  className="text-[#0a1e42] hover:underline font-medium">
                  Sign in
                </Link>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
);

}



export default SignUpPage;