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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiselect";

interface IdeaDetailsProps {
  idea: Idea;
  user: User | null;
  hasLiked: boolean;
  ideaLikes: number;
  onLikeIdea: () => Promise<void>;
  onCollaborationUpdated: () => void;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

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
  const [isVisibilityPrivate, setIsVisibilityPrivate] = useState<boolean>(false);
  const users = ["Alice", "Bob", "Charlie", "David"]

  const handleVisibilityChange = (value: string) => {
    if(value === "private") {
      return setIsVisibilityPrivate(true);
    }
    setFormData((prev) => ({ ...prev, visibility: value }));
  }

  const OPTIONS = ["All", "Popular", "Recent", "Trending", "Archived", "All1", "Popular1", "Recent1", "Trending1", "Archived1", "All2", "Popular2", "Recent2", "Trending2", "Archived2"];
  const [formData, setFormData] = useState({
    visibility: "public",
    collaborator: [] as string[],
  });
  
  const handleMultiSelectChange = (value=[]) => {
    setFormData((prev) => ({ ...prev, collaborator: value }));
  }

  useEffect(()=>{
    setFormData({
      visibility: 'public',
      collaborator: [...users]
    })
  },[])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl text-[#0a1e42]">Idea Details</CardTitle>
              {
                (isAdmin || isOwner || isCollaborator || isMentor) &&
                <>
                  <Select 
                    value={formData.visibility}
                    onValueChange={handleVisibilityChange}
                  >
                    <SelectTrigger id="visibility" className="w-[125px]" size="sm">
                      <SelectValue placeholder="Visiblity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public"><Globe className="size-5" /> Public</SelectItem>
                      <SelectItem value="private"><GlobeLock className="size-5" /> Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {
                    formData?.collaborator.length > 0 && 
                    <Popover>
                      <PopoverTrigger asChild>
                        <Users className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                      </PopoverTrigger>

                      <PopoverContent side="bottom" align="start" className="w-[220px] p-2 space-y-2">
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {Array.isArray(formData.collaborator) && formData.collaborator.map((user) => (
                            <div
                              key={user}
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <UserIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-800">{user}</span>
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

      {/* Details Dialog */}
      <Dialog
        open={isVisibilityPrivate}
        onOpenChange={setIsVisibilityPrivate}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-xl" >
            <>
              <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-[#0a1e42]/90 to-[#0a1e42] text-white">
                <DialogTitle className="text-2xl">
                  Add collaborators
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[calc(80vh-150px)] overflow-y-auto">
                <AnimatePresence>
                  <motion.div
                    className="space-y-2 col-span-4 md:col-span-3"
                    variants={fadeInUp}>
                    <Label
                      htmlFor="collaborator"
                      className="text-sm font-medium">
                      Collaborator
                    </Label>
                    <MultiSelect
                      options={[...OPTIONS, ...users]}
                      value={formData.collaborator}
                      onValueChange={handleMultiSelectChange}
                      placeholder="Select Collaborator"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <DialogFooter className="bg-gray-50 border-t px-6 py-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsVisibilityPrivate(false)
                      setFormData({
                        visibility: "public",
                        collaborator: formData.collaborator?.length > 0 ? [...formData.collaborator] : [],
                      });
                    }}
                    className="border-gray-300">
                    Close
                  </Button>
                  <Button
                    className="bg-[#0a1e42] hover:bg-[#162d5a] shadow-sm"
                    onClick={() => {
                      setIsVisibilityPrivate(false)
                      setFormData({
                        visibility: "private",
                        collaborator: [...formData.collaborator],
                      });
                    }}
                    disabled={Array.isArray(formData.collaborator) && formData.collaborator?.length === 0}>
                    Add Collaborator
                  </Button>
                </div>
              </DialogFooter>
            </>
        </DialogContent>
      </Dialog>
    </div>
  );
}
