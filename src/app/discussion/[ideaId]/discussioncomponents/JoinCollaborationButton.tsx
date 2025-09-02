"use client";

import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "./types";

interface JoinCollaborationButtonProps {
  user: User | null;
  isOwner: boolean;
  isCollaborator: boolean;
  isLoading: boolean;
  handleJoinCollaboration: () => Promise<void>;
  handleLeaveCollaboration: () => Promise<void>;
}

export default function JoinCollaborationButton({
  user,
  isOwner,
  isCollaborator,
  isLoading,
  handleJoinCollaboration,
  handleLeaveCollaboration,
}: JoinCollaborationButtonProps) {

  if (!user) {
    return (
      <Button 
        variant="secondary"
        size="sm"
        disabled
        className="text-sm">
        <Users className="h-4 w-4 mr-1" />
        Sign in to Join
      </Button>
    );
  }

  if (isOwner) {
    return (
      <Button 
        variant="outline"
        size="sm" 
        disabled
        className="text-sm bg-gray-50 cursor-default">
        <Users className="h-4 w-4 mr-1" />
        You&apos;re the Owner
      </Button>
    );
  }

  if (isCollaborator) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleLeaveCollaboration}
        disabled={isLoading}
        className="text-sm">
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Users className="h-4 w-4 mr-1" />
        )}
        Leave Collaboration
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleJoinCollaboration}
      disabled={isLoading}
      className="text-sm">
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Users className="h-4 w-4 mr-1" />
      )}
      Join as Collaborator
    </Button>
  );
}
