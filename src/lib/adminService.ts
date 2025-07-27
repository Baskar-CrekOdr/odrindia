
import { apiFetch } from '@/lib/api';
import { fetchAndStoreCsrfToken, getCsrfToken } from '@/lib/csrf';

/**
 * Admin API service that handles authentication and API calls for admin functions
 */
class AdminService {
  /**
   * Get pending idea submissions
   */
  async getPendingIdeas() {
    try {
      if (!getCsrfToken()) {
        await fetchAndStoreCsrfToken();
      }
      const response = await apiFetch('/admin/approve-idea');
      if (!response.ok) {
        let errorMsg = `Failed with status: ${response.status}`;
        let errorType = 'Unknown';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
          if (response.status === 401) errorType = 'Authentication';
          if (response.status === 403) errorType = 'CSRF';
        } catch {}
        console.error(`[AdminService] Error fetching pending ideas (${errorType}):`, errorMsg);
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AdminService] Network or unexpected error fetching pending ideas:', error.message);
        throw new Error('Network error or unexpected issue. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Approve an idea submission
   */
  async approveIdea(ideaId: string) {
    try {
      if (!getCsrfToken()) {
        await fetchAndStoreCsrfToken();
      }
      const response = await apiFetch('/admin/approve-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId })
      });
      if (!response.ok) {
        let errorMsg = `Failed with status: ${response.status}`;
        let errorType = 'Unknown';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
          if (response.status === 401) errorType = 'Authentication';
          if (response.status === 403) errorType = 'CSRF';
        } catch {}
        console.error(`[AdminService] Error approving idea (${errorType}):`, errorMsg);
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AdminService] Network or unexpected error approving idea:', error.message);
        throw new Error('Network error or unexpected issue. Please try again.');
      }
      throw error;
    }
  }
  /**
   * Get pending mentor applications
   */
  async getPendingMentors() {
    try {
      if (!getCsrfToken()) {
        await fetchAndStoreCsrfToken();
      }
      const response = await apiFetch('/admin/approve-mentor');
      if (!response.ok) {
        let errorMsg = `Failed with status: ${response.status}`;
        let errorType = 'Unknown';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
          if (response.status === 401) errorType = 'Authentication';
          if (response.status === 403) errorType = 'CSRF';
        } catch {}
        console.error(`[AdminService] Error fetching pending mentors (${errorType}):`, errorMsg);
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AdminService] Network or unexpected error fetching pending mentors:', error.message);
        throw new Error('Network error or unexpected issue. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Approve a mentor application
   */
  async approveMentor(userId: string) {
    try {
      if (!getCsrfToken()) {
        await fetchAndStoreCsrfToken();
      }
      const response = await apiFetch('/admin/approve-mentor', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        let errorMsg = `Failed with status: ${response.status}`;
        let errorType = 'Unknown';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
          if (response.status === 401) errorType = 'Authentication';
          if (response.status === 403) errorType = 'CSRF';
        } catch {}
        console.error(`[AdminService] Error approving mentor (${errorType}):`, errorMsg);
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AdminService] Network or unexpected error approving mentor:', error.message);
        throw new Error('Network error or unexpected issue. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Reject a mentor application
   */
  async rejectMentor(userId: string, reason?: string) {
    try {
      if (!getCsrfToken()) {
        await fetchAndStoreCsrfToken();
      }
      const response = await apiFetch('/admin/approve-mentor/reject', {
        method: 'POST',
        body: JSON.stringify({ userId, reason })
      });
      if (!response.ok) {
        let errorMsg = `Failed with status: ${response.status}`;
        let errorType = 'Unknown';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
          if (response.status === 401) errorType = 'Authentication';
          if (response.status === 403) errorType = 'CSRF';
        } catch {}
        console.error(`[AdminService] Error rejecting mentor (${errorType}):`, errorMsg);
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AdminService] Network or unexpected error rejecting mentor:', error.message);
        throw new Error('Network error or unexpected issue. Please try again.');
      }
      throw error;
    }
  }
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;
