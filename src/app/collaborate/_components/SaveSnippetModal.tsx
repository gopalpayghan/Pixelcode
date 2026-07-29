"use client";

import { useState } from "react";
import { Globe, Lock, X, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

interface SaveSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, isPublic: boolean) => Promise<void>;
  language: string;
  roomId: string;
}

export default function SaveSnippetModal({
  isOpen,
  onClose,
  onSave,
  language,
  roomId,
}: SaveSnippetModalProps) {
  const [title, setTitle] = useState(`Collaborative Session ${roomId}`);
  const [isPublic, setIsPublic] = useState(false); // default private for collab sessions
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for your snippet.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(title.trim(), isPublic);
      setTitle(`Collaborative Session ${roomId}`);
      setIsPublic(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card variant="default" className="p-6 relative shadow-level-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-mute hover:text-ink rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <FolderPlus className="w-4 h-4 text-link" />
            <h2 className="text-body-md font-semibold text-ink">Save to Snippets</h2>
          </div>
          <p className="text-caption text-mute mb-6">
            Save this collaborative {language} session to your Snippets library.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-caption text-body font-medium mb-1.5">
                Snippet Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Room Session - Sorting Algorithms"
                className="w-full h-10 px-3 bg-canvas-soft border border-hairline focus:border-link rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none transition-colors"
              />
            </div>

            {/* Visibility Toggle */}
            <div>
              <label className="block text-caption text-body font-medium mb-2">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    isPublic
                      ? "bg-link/10 border-link text-link"
                      : "bg-canvas-soft border-hairline text-mute hover:border-hairline-strong"
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
                      ? "bg-warning/10 border-warning text-warning"
                      : "bg-canvas-soft border-hairline text-mute hover:border-hairline-strong"
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs">Private</div>
                    <div className="text-[10px] opacity-70">Only you can see it</div>
                  </div>
                </button>
              </div>

              <p className="mt-2 text-[11px] text-mute">
                {isPublic
                  ? "🌍 Will appear in the public Community Snippets library."
                  : "🔒 Saved to your personal library only. Not visible to others."}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                icon={
                  isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FolderPlus className="w-3.5 h-3.5" />
                  )
                }
              >
                {isSaving ? "Saving..." : isPublic ? "Publish Snippet" : "Save Privately"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
