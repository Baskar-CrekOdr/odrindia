"use client";
import { Globe, GlobeLock, ThumbsUp, User as UserIcon, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Idea, User } from "./types";
import JoinCollaborationButton from "./JoinCollaborationButton";
import RequestMentorButton from "./RequestMentorButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateIdeaDetails } from "./api";
import { toast } from "sonner";

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
  },[])

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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Users className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                      </PopoverTrigger>

                      <PopoverContent side="bottom" align="start" className="w-[220px] p-2 space-y-2">
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
                      </PopoverContent>
                    </Popover>
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
                  ideaId={idea.id}
                  user={user}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  onJoined={onCollaborationUpdated}
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
    </div>
  );
}
