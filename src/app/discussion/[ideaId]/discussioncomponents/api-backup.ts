import { apiFetch } from "@/lib/api";
import { Idea, Comment } from "./types";

// Helper to create Authorization headers if accessToken is provided
export async function fetchIdeaDetails(ideaId: string | null): Promise<Idea> {
  if (!ideaId) {
    throw new Error("Idea ID is required");
  }
  
  try {
    // Use global apiFetch which handles authentication automatically
    const res = await apiFetch(`/ideas/${ideaId}`);
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch idea details: ${res.status} ${res.statusText}${errorData.message ? ' - ' + errorData.message : ''}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching idea details:', error);
    throw error;
  }
}
    
// Fetch comments with authentication
export async function fetchComments(ideaId: string | null, accessToken?: string | null): Promise<Comment[]> {
  if (!ideaId) {
    return [];
  }
  
  try {
    const res = await apiFetch(`/ideas/${ideaId}/comments`, { headers: createAuthHeaders(accessToken) });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to fetch comments');
    }
    // Map 'author' to 'user' recursively for all comments and replies
    const mapComment = (comment: any): Comment => ({
      ...comment,
      user: comment.author,
      replies: comment.replies ? comment.replies.map(mapComment) : [],
    });
    const comments = await res.json();
    return comments.map(mapComment);
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

// Check if user has liked an idea
export async function checkIdeaLikeStatus(ideaId: string, userId: string, accessToken?: string | null): Promise<boolean> {
  try {
    const res = await apiFetch(`/ideas/${ideaId}/likes/check?userId=${userId}`, { headers: createAuthHeaders(accessToken) });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to check like status');
    }
    
    const data = await res.json();
    return data.liked;
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
}

// Fetch comments liked by user
export async function fetchLikedComments(ideaId: string, userId: string, accessToken?: string | null): Promise<string[]> {
  try {
    const res = await apiFetch(`/ideas/${ideaId}/comments/liked?userId=${userId}`, { headers: createAuthHeaders(accessToken) });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to fetch liked comments');
    }
    
    const data = await res.json();
    return data.likedComments || [];
  } catch (error) {
    console.error('Error fetching liked comments:', error);
    throw error;
  }
}

// Like or unlike an idea
export async function likeIdea(ideaId: string, userId: string, action: 'like' | 'unlike', accessToken?: string | null) {
  try {
    const res = await apiFetch(`/ideas/${ideaId}/likes`, {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ action }) // Remove userId - backend uses authenticated user from JWT
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to update like');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating idea like:', error);
    throw error;
  }
}

// Like or unlike a comment
export async function likeComment(ideaId: string, commentId: string, userId: string, action: 'like' | 'unlike', accessToken?: string | null) {
  try {
    const res = await apiFetch(`/ideas/${ideaId}/comments/${commentId}/likes`, {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ action }) // Remove userId - backend uses authenticated user from JWT
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to update comment like');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating comment like:', error);
    throw error;
  }
}

// Post a comment
export async function postComment(ideaId: string, userId: string, content: string, parentId?: string, accessToken?: string | null) {
  try {
    const res = await apiFetch(`/ideas/${ideaId}/comments`, {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify({ userId, content, parentId })
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to post comment');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}
function createAuthHeaders(accessToken: string | null | undefined): HeadersInit | undefined {
  if (!accessToken) return undefined;
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

