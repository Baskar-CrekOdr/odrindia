// Types used throughout the discussion components
// Make sure these types match our Prisma schema and are used consistently in the application

export interface User {
  id: string;
  name: string;
  email: string;
  userRole: "INNOVATOR" | "MENTOR" | "ADMIN" | "OTHER" | "FACULTY";
  hasMentorApplication?: boolean;
  isMentorApproved?: boolean;
  mentorRejectionReason?: string | null;
  contactNumber?: string | null;
  city?: string | null;
  country?: string | null;
  institution?: string | null;
  highestEducation?: string | null;
  odrLabUsage?: string | null;
  createdAt?: string;
}

export interface Idea {
  id: string;
  title: string;
  caption?: string;
  description: string;
  priorOdrExperience?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  collaborators: IdeaCollaborator[];
  mentors: IdeaMentor[];
  views: number;
  likes: number;
  commentCount: number;
}

export interface IdeaCollaborator {
  userId: string;
  ideaId: string;
  joinedAt: string;
  user: User;
}

export interface IdeaMentor {
  userId: string;
  ideaId: string;
  assignedAt: string;
  user: User;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  ideaId: string;
  userId: string;
  user: User;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  likes: number;
}
