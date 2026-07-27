"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { X, Sparkles, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface ShareSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareSnippetModal({ isOpen, onClose }: ShareSnippetModalProps) {
  const { user } = useAuthContext();
  const { language, getCode } = useCodeEditorStore();
  const createSnippet = useMutation(api.snippets.createSnippet);

  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for your snippet.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to share snippets.");
      return;
    }

    const code = getCode();
    if (!code || !code.trim()) {
      toast.error("Cannot share empty code.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createSnippet({
        userId: user.userId,
        userName: user.name,
        title: title.trim(),
        language,
        code,
      });

      toast.success("Snippet published to Community Snippets!");
      setTitle("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish snippet";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md">
        <Card variant="default" className="p-6 relative shadow-level-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-mute hover:text-ink rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-link" />
            <h2 className="text-body-md font-semibold text-ink">Publish Snippet</h2>
          </div>
          <p className="text-caption text-mute mb-6">
            Share your {language} code snippet with the PixelCode community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-caption text-body font-medium mb-1.5">
                Snippet Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Binary Search Tree Implementation"
                className="w-full h-10 px-3 bg-canvas-soft border border-hairline focus:border-link rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                icon={<Share2 className="w-3.5 h-3.5" />}
              >
                Publish Snippet
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
