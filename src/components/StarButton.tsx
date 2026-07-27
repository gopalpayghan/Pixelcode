import { useAuthContext } from "@/components/providers/AuthProvider";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star } from "lucide-react";

function StarButton({ snippetId }: { snippetId: Id<"snippets"> }) {
  const { user } = useAuthContext();

  const isStarred = useQuery(
    api.snippets.isSnippetStarred,
    user?.userId ? { snippetId, userId: user.userId } : "skip"
  );
  const starCount = useQuery(api.snippets.getSnippetStarCount, { snippetId });
  const star = useMutation(api.snippets.starSnippet);

  const handleStar = async () => {
    if (!user) return;
    await star({ snippetId, userId: user.userId });
  };

  return (
    <button
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
    transition-all duration-200 ${
      isStarred
        ? "bg-warning/10 text-warning hover:bg-warning/20"
        : "bg-canvas-soft text-mute hover:text-ink"
    }`}
      onClick={handleStar}
    >
      <Star
        className={`w-4 h-4 ${isStarred ? "fill-warning text-warning" : "fill-none text-mute group-hover:text-ink"}`}
      />
      <span className={`text-xs font-medium ${isStarred ? "text-warning" : "text-mute"}`}>
        {starCount ?? 0}
      </span>
    </button>
  );
}

export default StarButton;
