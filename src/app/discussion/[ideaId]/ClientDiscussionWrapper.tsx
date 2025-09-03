"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DiscussionClient from "./DiscussionClient";
import { fetchIdeaDetails, fetchComments, validateCollabInviteLink } from "./discussioncomponents/api";
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
  const router = useRouter();

  useEffect(() => {
    async function loadDiscussionData() {
      try {
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

    if (authLoading) return; // Don’t run logic until auth is ready

    const inviteId = new URLSearchParams(window.location.search).get("invite");

    (async () => {
      if (inviteId) {
        try {
          const { valid } = await validateCollabInviteLink(inviteId);
          if (valid) {
            sessionStorage.setItem("invite", "true");
          }
        } finally {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }

      if (user) {
        loadDiscussionData();
      } else {
        if (inviteId) {
          const currentPath = window.location.pathname + window.location.search;
          const redirectUrl = `/signin?expired=true&redirect=${encodeURIComponent(currentPath)}`;
          router.push(redirectUrl);
          return;
        } else {
          // Only set error if we know auth has finished AND no user
          setError("Authentication required to view this discussion");
          setLoading(false);
        }
      }
    })();
  }, [ideaId, user, authLoading, router]);

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

  return <DiscussionClient idea={idea} initialComments={comments} setError={setError}/>;
}
