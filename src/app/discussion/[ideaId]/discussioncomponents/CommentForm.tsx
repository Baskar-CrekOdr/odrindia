import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getInitials } from "./utils";
import { User } from "./types";

interface CommentFormProps {
  ideaId: string;
  user: User | null;
  onSubmitComment: (content: string) => Promise<void>;
}

export default function CommentForm({
  ideaId,
  user,
  onSubmitComment,
}: CommentFormProps) {
  const [commentContent, setCommentContent] = useState("");

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      await onSubmitComment(commentContent);
      setCommentContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to post comment.");
    }
  };
  
  return (
    <div className="mb-6 flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-[#0a1e42] text-white">
          {user ? getInitials(user.name) : "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {user ? (
          <>
            <div className="mb-1 text-sm text-gray-500">
              Commenting as{" "}
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <Textarea
              placeholder="Share your thoughts on this idea..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="mb-2 resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                className="bg-[#0a1e42] hover:bg-[#263e69]"
                disabled={!commentContent.trim()}>
                Post Comment
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-gray-600">
              Please sign in to join the discussion.
            </p>
            <Link
              href="/signin"
              className="mt-2 inline-block text-sm text-blue-500 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
