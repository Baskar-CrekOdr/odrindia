import { z } from "zod";

export const ideaSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(250, "Title should be less than 250 characters"),
  visibility: z.string().refine(val => val === "PUBLIC" || val === "PRIVATE", { message: "Visibility must be either 'public' or 'private'" }),
  idea_caption: z.string().max(100, "Caption should be less than 100 characters").optional(),
  description: z.string().min(1, "Description is required"),
  odr_experience: z.string().min(1, "ODR experience is required"),
  consent: z.boolean().refine(val => val === true, { message: "Consent is required" }),
});

export type IdeaSubmissionInput = z.infer<typeof ideaSubmissionSchema>;

// New schema for updating ideas
export const ideaUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(250, "Title should be less than 250 characters").optional(),
  caption: z.string().max(100, "Caption should be less than 100 characters").optional(),
  description: z.string().min(1, "Description is required").optional(),
  priorOdrExperience: z.string().optional(),
});

export type IdeaUpdateInput = z.infer<typeof ideaUpdateSchema>;
