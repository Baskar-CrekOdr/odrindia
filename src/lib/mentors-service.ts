import { apiFetch } from "./api";

// Define type for mentor
export interface MentorWithIdeas {
  id: string;
  name: string;
  email: string;
  userRole?: string;
  contactNumber?: string;
  city?: string;
  country?: string;
  institution?: string;
  organization?: string;
  highestEducation?: string;
  odrLabUsage?: string;
  imageAvatar?: string;
  approved?: boolean;
  isMentorApproved?: boolean; // Kept for backward compatibility
  mentorType?: string;
  expertise?: string;
  role?: string;
  description?: string;
  createdAt: string;
  mentoringIdeas?: Array<{
    role?: string;
    idea: {
      id: string;
      title: string;
      caption?: string;
      description?: string;
      createdAt: string;
    }
  }>;
  ideas?: {
    id: string;
    title: string;
    caption?: string;
    description?: string;
    createdAt: string;
    views?: number;
  }[];
}

// Get all mentors
export async function getAllMentors(): Promise<MentorWithIdeas[]> {
  try {
    const response = await apiFetch("/mentors");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mentors: ${response.status}`);
    }
    
    const data = await response.json();
    // console.log("Mentors API response:", data);
    
    // Process mentors to include all needed fields and handle field name discrepancies
    if (data.mentors && Array.isArray(data.mentors)) {
      const processedMentors = data.mentors.map((mentor: any) => {
        // Create ideas array from mentoringIdeas if it exists
        let ideas = [];
        if (mentor.mentoringIdeas && Array.isArray(mentor.mentoringIdeas)) {
          ideas = mentor.mentoringIdeas.map((item: any) => item.idea);
        }
        
        return {
          ...mentor,
          // Map approved field to isMentorApproved for backward compatibility
          isMentorApproved: mentor.approved === undefined ? true : mentor.approved,
          // Ensure we have ideas in the expected format
          ideas: ideas.length > 0 ? ideas : mentor.ideas || []
        };
      });
      
      // No filtering - return all mentors, approval status can be handled in UI
      return processedMentors;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return []; // Return empty array instead of throwing to prevent UI breaking
  }
}

// Get individual mentor details
export async function getMentor(id: string): Promise<MentorWithIdeas> {
  try {
    const response = await apiFetch(`/mentors/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mentor: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching mentor with ID ${id}:`, error);
    throw error;
  }
}
