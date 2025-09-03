"use client";
import { BookOpen, Globe, GlobeLock, ThumbsUp, User as UserIcon, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Idea, User } from "./types";
import JoinCollaborationButton from "./JoinCollaborationButton";
import RequestMentorButton from "./RequestMentorButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react";
import { updateIdeaDetails } from "./api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

interface IdeaDetailsProps {
  idea: Idea;
  user: User | null;
  hasLiked: boolean;
  ideaLikes: number;
  onLikeIdea: () => Promise<void>;
  onCollaborationUpdated: () => void;
}

export default function IdeaDetails({
  idea,
  user,
  hasLiked,
  ideaLikes,
  onLikeIdea,
  onCollaborationUpdated,
}: IdeaDetailsProps) {
  // Check if current user is admin, owner, collaborator or mentor
  const isAdmin = user ? user.userRole.toLowerCase() === "admin" : false;
  const isOwner = user ? user.id === idea.owner.id : false;
  const isCollaborator = user ? idea.collaborators.some((c) => c.userId === user.id) : false;
  const isMentor = user ? idea.mentors.some((m) => m.userId === user.id) : false;
  const [collaborators, setCollaborators] = useState<{ id: string; name: string }[]>([]);
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVisibilityChange = async (value: "PUBLIC" | "PRIVATE") => {
    const res = await updateIdeaDetails(idea.id, {  
      visibility: value,
    })
    if(res?.visibility === value) {
      setFormData((prev) => ({ ...prev, visibility: value }));
      toast.success("Idea visibility updated successfully!");
    }
  }

  const [formData, setFormData] = useState({
    visibility: "PUBLIC",
  });
  
  useEffect(()=>{
    setFormData({
      visibility: idea?.visibility || '',
    })
    setCollaborators(idea.collaborators.map(c => ({ id: c.userId, name: c.user?.name || '--' })) || [])
    setMentors(idea.mentors.map(c => ({ id: c.userId, name: c.user?.name || '--' })) || [])

    const inviteFlag = sessionStorage.getItem('invite');
    if(inviteFlag === 'true') {
      const collabStatus = idea?.ideaCollabInviteStatus;
      if (!collabStatus || !Array.isArray(collabStatus)) return;
      const userInvite = collabStatus.find(
        (invite: { userId: string; invitestatus: string }) => invite.userId === user?.id
      );
      if (userInvite?.invitestatus === 'PENDING') {
        setIsOpen(true);
      }
    }
  },[idea])
  
  const handleJoinCollaboration = async (action?:string) => {
    if (!user) {
      toast.error(`Please sign in to ${action? 'accept the collaborator invite.' : 'join as a collaborator.'}`);
      return;
    }

    if (isOwner) {
      toast.error("You are already the owner of this idea.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(`/collaboration/${idea.id}/join-collaborator`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (action ? `Failed to accept collaboration invite` : `Failed to join as collaborator`));
      }

      toast.success(
        action
          ? `You have accepted the collaborator invite for this idea.`
          : "You have joined as a collaborator."
      );
      
      onCollaborationUpdated();
    } catch (error) {
      console.error(`Error ${action? "accepting" : "joining"} collaboration:`, error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCollaboration = async (action?:string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await apiFetch(`/collaboration/${idea.id}/leave-collaborator`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (action ? `Failed to reject collaboration invite` : `Failed to leave collaboration`));
      }

      toast.success(
        action
          ? `You have rejected the collaboration invite for this idea.`
          : "You have left the collaboration."
      );
      
      onCollaborationUpdated();
    } catch (error) {
      console.error(`Error ${action? "rejecting" : "leaving"} collaboration:`, error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl text-[#0a1e42]">Idea Details</CardTitle>
              {
                (isAdmin || isOwner) &&
                <>
                  <Select 
                    value={formData.visibility}
                    onValueChange={handleVisibilityChange}
                  >
                    <SelectTrigger id="visibility" className="w-[125px]" size="sm">
                      <SelectValue placeholder="Visiblity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC"><Globe className="size-5" /> Public</SelectItem>
                      <SelectItem value="PRIVATE"><GlobeLock className="size-5" /> Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {
                    collaborators.length > 0 && 
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <Users className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent side="bottom" align="start" className="w-[220px] p-2">
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                              {Array.isArray(collaborators) && collaborators.map((collaborator) => (
                                  <div
                                    key={collaborator.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                  >
                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-800">{collaborator.name || '--'}</span>
                                  </div>
                                ))}
                            </div>
                          </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                  }
                  {
                    mentors.length > 0 && 
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <BookOpen className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent side="bottom" align="start" className="w-[220px] p-2">
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                              {Array.isArray(mentors) && mentors.length > 0 ? (
                                mentors.map((mentor) => (
                                  <div
                                    key={mentor.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                  >
                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-800">
                                      {mentor.name || "--"}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500 px-3 py-2">
                                  No mentors found
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                  }
                </>
              }
            </div>
            {user ? (
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={onLikeIdea}
                className={hasLiked ? "bg-[#0a1e42] hover:bg-[#263e69]" : ""}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                {ideaLikes}
              </Button>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <ThumbsUp className="mr-2 h-4 w-4" />
                <span>{ideaLikes}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{idea.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/discussion/${idea.id}/workplace`}>
                <Button className="bg-[#0a1e42] hover:bg-[#263e69]">
                  Join Idea Workplace Meeting
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <JoinCollaborationButton
                  user={user}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  isLoading={isLoading}
                  handleJoinCollaboration={handleJoinCollaboration}
                  handleLeaveCollaboration={handleLeaveCollaboration}
                />

                <RequestMentorButton
                  ideaId={idea.id}
                  user={user}
                  isOwner={isOwner}
                  isMentor={isMentor}
                  onRequested={onCollaborationUpdated}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ...existing team card and tabs... */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:min-w-xl p-0 overflow-hidden rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
          showCloseIcon = {false}
          onPointerDownOutside={(event) => {
            event.preventDefault(); // Prevent closing when clicking outside
          }}
        >
          <>
            <DialogTitle></DialogTitle>
            <div className="p-6 space-y-6 max-h-[calc(80vh-150px)] overflow-y-auto">
              <p className="text-md sm:text-lg lg-text-xl font-medium text-[#0a1e42] text-center whitespace-break-spaces">
                {user?.name} has invited you to collaborate on their idea. Join the discussion now!
              </p>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={()=>{
                    setIsOpen(!isOpen)
                    handleLeaveCollaboration('reject');
                    sessionStorage.removeItem('invite');
                  }}
                  className="border-gray-300">
                  Reject
                </Button>
                <Button
                  className="bg-[#0a1e42] hover:bg-[#162d5a] shadow-sm"
                  disabled={isLoading}
                  onClick={() => {
                    setIsOpen(!isOpen)
                    handleJoinCollaboration('accept');
                    sessionStorage.removeItem('invite');
                  }}
                >
                  Accept
                </Button>
              </div>
            </div>
          </>
        </DialogContent>
      </Dialog>
    </div>
  );
}
