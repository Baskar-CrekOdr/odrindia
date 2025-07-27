"use client";
import { LightbulbIcon, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ideaSubmissionSchema } from "./ideaSchema";
import { saveSubmissionRecord } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { fetchAndStoreCsrfToken } from "@/lib/csrf";

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

export default function SubmitIdeaClientPage() {
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    idea_caption: "",
    description: "",
    odr_experience: "",
    consent: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Page is now protected by PageGuard component

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing in a field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));

    // Clear error when user checks the consent box
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Always ensure CSRF token is present before submitting
    await fetchAndStoreCsrfToken();

    // Client-side Zod validation
    const parsed = ideaSubmissionSchema.safeParse(formData);
    if (!parsed.success) {
      setFormErrors(parsed.error.flatten().fieldErrors);
      toast.error("Validation Error", {
        description: "Please correct the highlighted fields.",
      });
      return;
    } else {
      setFormErrors({});
    }

    setIsSubmitting(true);

    try {
      // Make sure user is logged in
      if (!user || !user.id) {
        toast.error("Authentication Required", {
          description: "Please sign in to submit an idea.",
        });
        return;
      }

      // Map frontend field names to what the backend expects
      const mappedData = {
        title: formData.title,
        caption: formData.idea_caption, // backend expects 'caption'
        description: formData.description,
        priorOdrExperience: formData.odr_experience, // backend expects 'priorOdrExperience'
      };

      const response = await apiFetch("/ideas/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedData), // Send mapped data instead of parsed.data
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check for validation errors from the server
        if (response.status === 400 && responseData.errors) {
          setFormErrors(responseData.errors);
          toast.error("Validation Error", {
            description: "Please correct the highlighted fields.",
          });
          return;
        }
        console.error("Server validation error:", responseData);
        throw new Error(responseData.message || "Failed to submit idea");
      }

      // Successful submission
      setIsSuccess(true);

      // If we have an idea ID, save it to localStorage for tracking
      if (responseData.ideaId) {
        saveSubmissionRecord("ideas", responseData.ideaId);
      }

      toast.success("Idea submitted successfully!", {
        description: "We'll review your submission and get back to you soon.",
      });

      // Reset form after showing success state
      setTimeout(() => {
        setFormData({
          title: "",
          idea_caption: "",
          description: "",
          odr_experience: "",
          consent: false,
        });
        setIsSuccess(false);
      }, 3000); // Increased to 3 seconds to give users more time to see the success message
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission failed", {
        description:
          error instanceof Error
            ? error.message
            : "There was a problem submitting your idea. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return formErrors[fieldName] && formErrors[fieldName].length > 0
      ? formErrors[fieldName][0]
      : null;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Banner with Animation */}
        <motion.section
          className="bg-[#0a1e42] py-4 md:py-8 text-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center relative z-10">
              <motion.div
                className="mb-6 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="rounded-full bg-sky-500/20 p-4">
                  <LightbulbIcon className="h-10 w-10 text-sky-400" />
                </div>
              </motion.div>
              <motion.h1
                className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                Got an idea for a better, <br className="hidden md:block" />{" "}
                tech-enabled dispute resolution system?
              </motion.h1>
              <motion.p
                className="text-lg text-gray-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}>
                Drop it on the Idea Board — every great change starts with a
                single seed.
              </motion.p>
            </div>
          </div>

          {/* Background Design Elements */}
          <motion.div
            className="absolute top-1/2 left-10 w-40 h-40 rounded-full bg-blue-500/10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-sky-400/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </motion.section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              {/* Form Card with Animation */}
              <AnimatePresence>
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0a1e42] mb-2">
                      Idea Submitted!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for sharing your innovative idea. We&apos;ll
                      review it and get back to you soon.
                    </p>

                    <div className="w-full max-w-sm p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-2">
                        What happens next?
                      </h4>
                      <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
                        <li>
                          Our team will review your idea within 2-3 business
                          days
                        </li>
                        <li>
                          You&apos;ll receive an email notification when your
                          idea is approved
                        </li>
                        <li>
                          Your idea will then be available for community
                          discussion
                        </li>
                      </ol>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    <Card className="border border-gray-200 shadow-sm overflow-hidden">
                      <CardHeader className="space-y-1 bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-2xl text-[#0a1e42]">
                          Share Your Idea
                        </CardTitle>
                        <CardDescription>
                          Help us create better online dispute resolution
                          systems with your innovative ideas.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <motion.form
                          className="space-y-6"
                          onSubmit={handleSubmit}
                          initial="hidden"
                          animate="visible"
                          variants={staggerContainer}>
                          <motion.div
                            className="space-y-2"
                            variants={fadeInUp}>
                            <Label
                              htmlFor="title"
                              className="text-sm font-medium">
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="Give your idea a compelling title"
                              className={`transition-all ${
                                getFieldError("title")
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              maxLength={250}
                            />
                            {getFieldError("title") && (
                              <p className="text-sm text-red-500 mt-1">
                                {getFieldError("title")}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={fadeInUp}>
                            <Label
                              htmlFor="idea_caption"
                              className="text-sm font-medium">
                              Caption{" "}
                              <span className="text-gray-400">(optional)</span>
                            </Label>
                            <Input
                              id="idea_caption"
                              name="idea_caption"
                              value={formData.idea_caption}
                              onChange={handleInputChange}
                              placeholder="A short tagline for your idea (max 100 chars)"
                              className={`transition-all ${
                                getFieldError("idea_caption")
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              maxLength={100}
                            />
                            {getFieldError("idea_caption") && (
                              <p className="text-sm text-red-500 mt-1">
                                {getFieldError("idea_caption")}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.idea_caption.length}/100 characters
                            </p>
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={fadeInUp}>
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium">
                              Description{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="Describe your concept, the area of dispute it addresses, and your vision for an ODR system to resolve it"
                              className={`min-h-[150px] resize-none transition-all ${
                                getFieldError("description")
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                            />
                            {getFieldError("description") && (
                              <p className="text-sm text-red-500 mt-1">
                                {getFieldError("description")}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={fadeInUp}>
                            <Label
                              htmlFor="odr_experience"
                              className="text-sm font-medium">
                              ODR Experience{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="odr_experience"
                              name="odr_experience"
                              value={formData.odr_experience}
                              onChange={handleInputChange}
                              placeholder="Have you previously worked on any ODR Platform? Please describe your experience"
                              className={`min-h-[100px] resize-none transition-all ${
                                getFieldError("odr_experience")
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                            />
                            {getFieldError("odr_experience") && (
                              <p className="text-sm text-red-500 mt-1">
                                {getFieldError("odr_experience")}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            variants={fadeInUp}
                            className="flex items-start space-x-2">
                            <div className="flex h-5 items-center mt-0.5">
                              <input
                                type="checkbox"
                                id="consent"
                                name="consent"
                                checked={formData.consent}
                                onChange={handleCheckboxChange}
                                className={`h-4 w-4 rounded border focus:ring-2 focus:ring-offset-0 transition-colors
                                  ${
                                    getFieldError("consent")
                                      ? "border-red-500 text-red-600 focus:ring-red-200"
                                      : "border-gray-300 text-[#0a1e42] focus:ring-[#0a1e42]/20"
                                  }`}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="consent"
                                className="text-sm text-gray-700">
                                I agree to the privacy policy and consent to the
                                processing of my personal data.
                              </label>
                              {getFieldError("consent") && (
                                <p className="text-sm text-red-500 mt-1">
                                  {getFieldError("consent")}
                                </p>
                              )}
                            </div>
                          </motion.div>

                          <motion.div variants={fadeInUp}>
                            <Button
                              type="submit"
                              className="w-full bg-[#0a1e42] hover:bg-[#162d5a] transition-all duration-200"
                              disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Idea"
                              )}
                            </Button>
                          </motion.div>
                        </motion.form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* What happens next section with animation */}
              <motion.div
                className="mt-12 rounded-xl bg-gray-50 p-6 md:p-8 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                <h3 className="mb-6 text-xl font-bold text-[#0a1e42]">
                  What happens next?
                </h3>
                <motion.div
                  className="space-y-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible">
                  <motion.div
                    className="flex items-start gap-4"
                    variants={fadeInUp}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a1e42] text-white shrink-0">
                      <span className="text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0a1e42] mb-1">
                        Connect & Collaborate
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Join the ODR Lab community to discuss your innovative
                        ideas with peers and experts.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4"
                    variants={fadeInUp}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a1e42] text-white shrink-0">
                      <span className="text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0a1e42] mb-1">
                        Expert Guidance
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Connect with ODR Mentors who will provide valuable
                        feedback and guidance on your concept.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4"
                    variants={fadeInUp}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a1e42] text-white shrink-0">
                      <span className="text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0a1e42] mb-1">
                        Create Impact
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Develop your idea into a working solution that can make
                        a real difference in the dispute resolution system.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-6 pt-4 border-t border-gray-200"
                    variants={fadeInUp}>
                    <Button
                      variant="outline"
                      className="gap-2 group">
                      Learn more about our process
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
