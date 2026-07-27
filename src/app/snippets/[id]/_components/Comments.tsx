import { useAuthContext } from "@/components/providers/AuthProvider";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import Link from "next/link";

function Comments({ snippetId }: { snippetId: Id<"snippets"> }) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletinCommentId, setDeletingCommentId] = useState<string | null>(null);

  const comments = useQuery(api.snippets.getComments, { snippetId }) || [];
  const addComment = useMutation(api.snippets.addComment);
  const deleteComment = useMutation(api.snippets.deleteComment);

  const handleSubmitComment = async (content: string) => {
    if (!user) {
      toast.error("Please sign in to add comments.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addComment({
        snippetId,
        userId: user.userId,
        userName: user.name,
        content,
      });
      toast.success("Comment added!");
    } catch (error) {
      console.log("Error adding comment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"snippetComments">) => {
    if (!user) return;
    setDeletingCommentId(commentId);

    try {
      await deleteComment({ commentId, userId: user.userId });
      toast.success("Comment deleted");
    } catch (error) {
      console.log("Error deleting comment:", error);
      toast.error("Something went wrong");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="bg-canvas border border-hairline rounded-2xl overflow-hidden shadow-level-2">
      <div className="px-6 sm:px-8 py-6 border-b border-hairline bg-canvas-soft">
        <h2 className="text-body-md font-semibold text-ink flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-link" />
          Discussion ({comments.length})
        </h2>
      </div>

      <div className="p-6 sm:px-8">
        {user ? (
          <CommentForm onSubmit={handleSubmitComment} isSubmitting={isSubmitting} />
        ) : (
          <div className="bg-canvas-soft rounded-xl p-6 text-center mb-8 border border-hairline">
            <p className="text-body-sm text-mute mb-4">Sign in to join the discussion</p>
            <Link href="/sign-in">
              <button className="px-6 py-2 bg-link text-white rounded-lg hover:bg-link-hover transition-colors text-body-sm font-medium">
                Sign In
              </button>
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onDelete={handleDeleteComment}
              isDeleting={deletinCommentId === comment._id}
              currentUserId={user?.userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default Comments;
