# ODR India: API, Schema, and Type Consistency Audit

## 1. Audit Purpose
This document tracks the process of auditing all API routes, backend schemas, and frontend types for mismatches, duplications, or inconsistencies. It will be updated as issues are found and resolved.

## 2. Backend API Routes (Express)
- **/api/auth**: login, signup, google-signin, complete-profile, check-google-user, refresh-token, session
- **/api/ideas**: submit, get all, get by id, update, delete, collaborators, mentors, comments, likes, team, etc.
- **/api/user**: profile (get/put), stats, apply-mentor
- **/api/mentors**: register, get all, get by id
- **/api/admin**: users, analytics, approve-idea, approve-mentor, ideas/pending, reject-idea
- **/api/collaboration**: collaborators, mentors (add/remove)
- **/api/discussion**: comments (get/add)
- **/api/odrlabs**: ideas (get all)
- **/api/meetings**: jaas-token
- **/api/chat**: chatbot
- **/api/contact**: contact form

## 3. Backend Schemas (Prisma)
- **User**: id, name, email, password, contactNumber, city, country, userRole, imageAvatar, createdAt, updatedAt, [relations: innovator, mentor, faculty, other, ideas, etc.]
- **Innovator**: userId, institution, highestEducation, courseName, courseStatus, description
- **Mentor**: userId, mentorType, organization, role, expertise, description, approved, reviewedAt, reviewedBy, rejectionReason
- **Faculty**: userId, institution, role, expertise, course, mentoring, description
- **Other**: userId, role, workplace, description
- **Idea**: id, title, caption, description, ownerId, createdAt, approved, etc.
- **IdeaCollaborator, IdeaMentor, Comment, Like, MeetingLog, etc.**

## 4. Frontend Types (TypeScript)
- **User**: id, name, email, userRole, hasMentorApplication, isMentorApproved, mentorRejectionReason, contactNumber, city, country, institution, highestEducation, odrLabUsage, imageAvatar, createdAt
- **Idea**: id, title, caption, description, ownerId, createdAt, approved, etc.
- **IdeaCollaborator, IdeaMentor, Comment, etc.**
- See `/src/app/discussion/[ideaId]/discussioncomponents/types.ts` for more.

## 5. Data Collection, Display, Fetch, Store Points
- **Frontend**:
  - `/src/lib/api.ts`: All API fetches
  - `/src/lib/auth.tsx`: Auth context, login/signup/profile
  - `/src/app/submit-idea/SubmitIdeaClientPage.tsx`: Idea submission
  - `/src/app/discussion/[ideaId]/*`: Idea details, comments, team, etc.
  - `/src/app/odrlabs/*`: ODR Lab ideas
  - `/src/app/mentors/*`: Mentor list/details
  - `/src/app/signup/page.tsx`, `/src/app/signin/page.tsx`: Auth forms
  - `/src/components/`: Data display components
- **Backend**: All `src/api/*` endpoints

## 6. Audit Progress Tracker
| Area | Issue | Status | Correction/Notes |
|------|-------|--------|------------------|
| Auth | JWT in localStorage in prod | Fixed | Removed completely, cookie-only |
| Auth | Duplicate login/logout | Fixed | Removed duplicates |
| Auth | Type mismatch in login | Fixed | Corrected types |
| Auth | Cross-origin cookies blocked | Fixed | Changed sameSite: "strict" to "none" for production |
| User Profile | Field mapping (frontend/backend) | TODO | Check all role-specific fields |
| Idea | Field mapping (frontend/backend) | TODO | Check all fields/types |
| Collaborators/Mentors | Data structure match | TODO | Check types/schemas |
| Comments | Author/user field match | TODO | Check naming consistency |
| API Routes | Route duplication | TODO | Check for duplicate/conflicting routes |
| API Routes | Route mismatch | TODO | Check for missing/extra routes |

## 7. Next Steps
- [ ] Check user profile field mapping (frontend/backend)
- [ ] Check idea field mapping (frontend/backend)
- [ ] Check collaborators/mentors types vs. schema
- [ ] Check comments types vs. schema
- [ ] Check for duplicate/mismatched API routes
- [ ] Update this doc as issues are found/fixed

---
*Last updated: 2025-07-15*
