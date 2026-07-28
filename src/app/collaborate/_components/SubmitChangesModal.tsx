"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { X, Send, FileCode, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import SideBySideDiff from "./SideBySideDiff";

interface SubmitChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  authorUserId: string;
  authorUserName: string;
  originalCode: string;
  proposedCode: string;
  language: string;
}

export default function SubmitChangesModal({
  isOpen,
  onClose,
  roomId,
  authorUserId,
  authorUserName,
  originalCode,
  proposedCode,
  language,
}: SubmitChangesModalProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitMut = useMutation(api.collaborativeSessions.submitChangeRequest);

  if (!isOpen) return null;

  // Compute simple diff stats
  const originalLines = originalCode.split("\n");
  const proposedLines = proposedCode.split("\n");
  const addedCount = proposedLines.filter(
    (line, i) => i >= originalLines.length || line !== originalLines[i]
  ).length;
  const removedCount = originalLines.filter(
    (line, i) => i >= proposedLines.length || line !== proposedLines[i]
  ).length;

  const hasChanges = originalCode !== proposedCode;

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please add a description for your changes");
      return;
    }
    if (!hasChanges) {
      toast.error("No changes detected in your code");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMut({
        roomId,
        authorUserId,
        authorUserName,
        description: description.trim(),
        originalCode,
        proposedCode,
        language,
      });
      toast.success("Change request submitted for review!");
      setDescription("");
      onClose();
    } catch {
      toast.error("Failed to submit change request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-canvas-elevated border border-hairline rounded-xl shadow-level-5 flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-link/10 text-link flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-body-sm font-semibold text-ink">
                Submit Change Request
              </h2>
              <p className="text-caption text-mute">
                Review side-by-side diff and submit to room admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-mute hover:text-ink hover:bg-canvas-soft-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
          {/* Diff stats header */}
          <div className="flex items-center justify-between p-3 bg-canvas-soft rounded-lg border border-hairline shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-mute shrink-0" />
              <span className="text-caption font-medium text-ink">
                Side-by-Side Diff Preview
              </span>
            </div>
            <div className="flex items-center gap-3 text-caption font-mono">
              <span className="text-success font-semibold">
                +{addedCount} added
              </span>
              <span className="text-error font-semibold">
                −{removedCount} removed
              </span>
              <span className="text-mute">
                {proposedLines.length} total lines
              </span>
            </div>
          </div>

          {!hasChanges && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-caption shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                No changes detected. Edit your draft code before submitting.
              </span>
            </div>
          )}

          {/* Side by side diff viewer */}
          <div className="h-64 shrink-0">
            <SideBySideDiff
              originalCode={originalCode}
              proposedCode={proposedCode}
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-caption text-body font-medium mb-1.5">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what you changed and why..."
              rows={3}
              className="w-full px-3 py-2.5 bg-canvas-soft border border-hairline rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none focus:border-link resize-none transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-hairline">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!hasChanges}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
}
