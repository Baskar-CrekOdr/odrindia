import { z } from "zod";

export const ideaSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(250, "Title should be less than 250 characters"),
  visibility: z.string().min(1, "Visibility is required").refine(val => val === "PUBLIC" || val === "PRIVATE", { message: "Visibility must be either 'public' or 'private'" }),
  collaborators: z.array(z.string().uuid()).optional(),
  idea_caption: z.string().max(100, "Caption should be less than 100 characters").optional(),
  description: z.string().min(1, "Description is required"),
  odr_experience: z.string().min(1, "ODR experience is required"),
  consent: z.boolean().refine(val => val === true, { message: "Consent is required" }),
}).superRefine((data, ctx) => {
  if (data.visibility === "PRIVATE") {
    if (!data.collaborators || data.collaborators.length < 1) {
      ctx.addIssue({
        path: ["collaborator"],
        code: z.ZodIssueCode.custom,
        message: "At least one collaborator is required when visibility is private",
      });
    }
  }
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
