"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DiscussionClient from "./DiscussionClient";
import { fetchIdeaDetails, fetchComments } from "./discussioncomponents/api";
import { Idea, Comment } from "./discussioncomponents/types";

interface ClientDiscussionWrapperProps {
  ideaId: string;
}

export default function ClientDiscussionWrapper({ ideaId }: ClientDiscussionWrapperProps) {
  const { user, loading: authLoading } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiscussionData() {
      try {
        // Fetch idea details and comments - apiFetch handles authentication automatically
        const ideaData = await fetchIdeaDetails(ideaId);
        setIdea(ideaData);
        
        const commentsData = await fetchComments(ideaId);
        setComments(commentsData);
      } catch (error: unknown) {
        console.error("Error loading discussion:", error);
        setError(error instanceof Error ? error.message : "Failed to load discussion");
      } finally {
        setLoading(false);
      }
    }

    // Wait for auth to finish loading, then check if user is authenticated
    if (!authLoading) {
      if (user) {
        loadDiscussionData();
      } else {
        setLoading(false);
        setError("Authentication required to view this discussion");
      }
    }
  }, [ideaId, user, authLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-lg w-full text-center">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-red-700">{error}</p>
          {error.includes("Authentication") && (
            <a href="/signin" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign in
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!idea) {
    return notFound();
  }

  return <DiscussionClient idea={idea} initialComments={comments} />;
}
