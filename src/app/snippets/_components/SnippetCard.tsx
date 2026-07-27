"use client";

import { Snippet } from "@/types";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2, User } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import StarButton from "@/components/StarButton";

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const { user } = useAuthContext();
  const deleteSnippet = useMutation(api.snippets.deleteSnippet);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);

    if (!user) return;
    try {
      await deleteSnippet({ snippetId: snippet._id, userId: user.userId });
      toast.success("Snippet deleted");
    } catch (error) {
      console.log("Error deleting snippet:", error);
      toast.error("Error deleting snippet");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={`/snippets/${snippet._id}`} className="block h-full">
        <div className="h-full bg-canvas border border-hairline hover:border-hairline-strong rounded-xl p-5 shadow-level-2 hover:shadow-level-3 transition-all duration-200 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-canvas-soft-2 border border-hairline flex items-center justify-center shrink-0">
                  <Image
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-canvas-soft border border-hairline text-caption font-mono text-mute rounded-md capitalize">
                    {snippet.language}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <StarButton snippetId={snippet._id} />

                {user?.userId === snippet.userId && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 rounded-md text-mute hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete snippet"
                  >
                    {isDeleting ? (
                      <div className="w-3.5 h-3.5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Title & Author */}
            <h2 className="text-body-md font-semibold text-ink line-clamp-1 group-hover:text-link transition-colors mb-2">
              {snippet.title}
            </h2>

            <div className="flex items-center gap-3 text-caption text-mute mb-4">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{snippet.userName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{new Date(snippet._creationTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-canvas-soft border border-hairline rounded-lg p-3 overflow-hidden">
              <pre className="font-mono text-caption text-body line-clamp-3 leading-relaxed">
                {snippet.code}
              </pre>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default SnippetCard;
