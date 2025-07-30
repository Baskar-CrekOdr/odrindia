"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ThumbsUp, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Comment, User } from "./types";
import { getInitials } from "./utils";

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
  ideaId: string;
  userId?: string;
  commentLikes: Record<string, boolean>;
  expandedComments: Record<string, boolean>;
  user: User | null;
  onLikeComment: (commentId: string) => Promise<void>;
  onReply: (parentId: string) => void;
  onSubmitReply: (parentId: string, content: string) => Promise<void>;
  onToggleExpand: (commentId: string) => void;
  replyingTo: string | null;
}

export default function CommentThread({
  comment,
  depth = 0,
  ideaId,
  userId,
  commentLikes,
  expandedComments,
  user,
  onLikeComment,
  onReply,
  onSubmitReply,
  onToggleExpand,
  replyingTo,
}: CommentThreadProps) {
  const [replyContent, setReplyContent] = useState("");
  const isExpanded = expandedComments[comment.id] !== false; // Default to expanded

  // Use either user or author field - simple inline solution
  const commentUser = comment.user || comment.author;
  const userInitials = commentUser ? getInitials(commentUser.name) : "?";

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await onSubmitReply(comment.id, replyContent);
      setReplyContent("");
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to post reply.");
    }
  };

  return (
    <div
      className={`border-l-2 ${
        depth > 0 ? "border-gray-200 pl-4" : "border-transparent"
      } mt-4`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[#0a1e42] text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {commentUser?.name || "Unknown"}
                </span>
                {commentUser?.userRole && (
                  <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {commentUser.userRole}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), "MMM d, yyyy")}
              </span>
            </div>

            <p className="text-gray-700">{comment.content}</p>

            <div className="mt-2 flex gap-4">
              {user ? (
                <button
                  onClick={() => onLikeComment(comment.id)}
                  className={`flex items-center gap-1 text-sm ${
                    commentLikes[comment.id]
                      ? "text-sky-600 font-medium"
                      : "text-gray-500"
                  }`}>
                  <ThumbsUp className="h-4 w-4" />
                  <span>
                    {comment.likes}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{comment.likes}</span>
                </div>
              )}

              {user ? (
                <button
                  onClick={() => onReply(comment.id)}
                  className={`flex items-center gap-1 text-sm ${
                    replyingTo === comment.id
                      ? "text-sky-600 font-medium"
                      : "text-gray-500"
                  }`}>
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>Sign in to reply</span>
                </Link>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => onToggleExpand(comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-500">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Hide replies</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show replies ({comment.replies.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#0a1e42] text-white">
                  {user ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {user ? (
                  <>
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2 h-20 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReply("")}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#0a1e42] hover:bg-[#263e69]"
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim()}>
                        Reply
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-gray-200 p-3 text-center text-sm">
                    <p className="text-gray-600">Please sign in to reply.</p>
                    <Link
                      href="/signin"
                      className="mt-1 inline-block text-xs text-blue-500 hover:text-blue-700">
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {isExpanded && comment.replies && comment.replies.length > 0 && (
            <div className="mt-1">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  ideaId={ideaId}
                  userId={userId}
                  commentLikes={commentLikes}
                  expandedComments={expandedComments}
                  user={user}
                  onLikeComment={onLikeComment}
                  onReply={onReply}
                  onSubmitReply={onSubmitReply}
                  onToggleExpand={onToggleExpand}
                  replyingTo={replyingTo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
