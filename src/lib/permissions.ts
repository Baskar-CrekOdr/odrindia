import { User } from '@/types/auth';

export const isMentorApproved = (user: User | null): boolean => {
  return !!user && user.userRole === "MENTOR" && !!user.isMentorApproved;
};

export const canAccessMentorFeatures = (user: User | null): boolean => {
  return isMentorApproved(user);
};

export const isPendingMentor = (user: User | null): boolean => {
  return !!user && user.userRole === "MENTOR" && !user.isMentorApproved;
};
