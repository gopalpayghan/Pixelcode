"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Globe, Lock, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/components/providers/AuthProvider";

function ShareSnippetDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuthContext();
  const { language, getCode } = useCodeEditorStore();
  const createSnippet = useMutation(api.snippets.createSnippet);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to share snippets.");
      return;
    }

    const code = getCode();
    if (!code || !code.trim()) {
      toast.error("Cannot share empty code.");
      return;
    }

    setIsSharing(true);

    try {
      await createSnippet({
        userId: user.userId,
        userName: user.name,
        title,
        language,
        code,
        isPublic,
      });
      onClose();
      setTitle("");
      toast.success(
        isPublic
          ? "Snippet published to Community Snippets! 🌍"
          : "Snippet saved privately to your library 🔒"
      );
    } catch (error) {
      console.log("Error creating snippet:", error);
      toast.error("Error creating snippet");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e2e] rounded-xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Share Snippet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter snippet title"
              required
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  isPublic
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-[#181825] border-[#313244] text-gray-400 hover:border-gray-500"
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Public</div>
                  <div className="text-[10px] opacity-70">Visible to everyone</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  !isPublic
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                    : "bg-[#181825] border-[#313244] text-gray-400 hover:border-gray-500"
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Private</div>
                  <div className="text-[10px] opacity-70">Only you can see it</div>
                </div>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {isPublic
                ? "🌍 Will appear in the public Community Snippets library."
                : "🔒 Saved to your personal library only. Not visible to others."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSharing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSharing ? "Saving..." : isPublic ? "Publish" : "Save Privately"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ShareSnippetDialog;
