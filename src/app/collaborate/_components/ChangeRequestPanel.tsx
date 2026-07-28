"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import {
  X,
  Check,
  XCircle,
  GitPullRequest,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChangeRequestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  adminName: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

// Simple line-by-line diff component
function InlineDiff({
  originalCode,
  proposedCode,
}: {
  originalCode: string;
  proposedCode: string;
}) {
  const diffLines = useMemo(() => {
    const origLines = originalCode.split("\n");
    const propLines = proposedCode.split("\n");
    const maxLen = Math.max(origLines.length, propLines.length);
    const result: { type: "same" | "added" | "removed"; content: string }[] =
      [];

    for (let i = 0; i < maxLen; i++) {
      const orig = i < origLines.length ? origLines[i] : undefined;
      const prop = i < propLines.length ? propLines[i] : undefined;

      if (orig === prop) {
        result.push({ type: "same", content: orig ?? "" });
      } else {
        if (orig !== undefined) {
          result.push({ type: "removed", content: orig });
        }
        if (prop !== undefined) {
          result.push({ type: "added", content: prop });
        }
      }
    }

    return result;
  }, [originalCode, proposedCode]);

  return (
    <div className="rounded-md border border-hairline overflow-hidden bg-canvas font-mono text-[12px] leading-5 max-h-64 overflow-y-auto">
      {diffLines.map((line, i) => (
        <div
          key={i}
          className={`px-3 py-0 flex items-start gap-2 ${
            line.type === "added"
              ? "bg-success/10 text-success"
              : line.type === "removed"
                ? "bg-error/10 text-error line-through"
                : "text-body"
          }`}
        >
          <span className="w-5 text-right text-mute/50 shrink-0 select-none">
            {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
          </span>
          <span className="whitespace-pre-wrap break-all">
            {line.content || " "}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChangeRequestPanel({
  isOpen,
  onClose,
  roomId,
  adminName,
}: ChangeRequestPanelProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const changeRequests = useQuery(
    api.collaborativeSessions.getChangeRequests,
    roomId ? { roomId } : "skip"
  );
  const approveMut = useMutation(
    api.collaborativeSessions.approveChangeRequest
  );
  const rejectMut = useMutation(
    api.collaborativeSessions.rejectChangeRequest
  );

  if (!isOpen) return null;

  const filtered =
    changeRequests?.filter((cr) =>
      filter === "all" ? true : cr.status === filter
    ) ?? [];

  const pendingCount =
    changeRequests?.filter((cr) => cr.status === "pending").length ?? 0;

  const handleApprove = async (requestId: Id<"changeRequests">) => {
    try {
      await approveMut({ requestId, reviewerName: adminName });
      toast.success("Change request approved & code applied!");
    } catch {
      toast.error("Failed to approve change request");
    }
  };

  const handleReject = async (requestId: Id<"changeRequests">) => {
    try {
      await rejectMut({ requestId, reviewerName: adminName });
      toast.success("Change request rejected");
    } catch {
      toast.error("Failed to reject change request");
    }
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3.5 h-3.5 text-warning" />;
      case "approved":
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case "rejected":
        return <XCircle className="w-3.5 h-3.5 text-error" />;
      default:
        return null;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "text-warning";
      case "approved":
        return "text-success";
      case "rejected":
        return "text-error";
      default:
        return "text-mute";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-canvas-elevated border-l border-hairline shadow-level-5 flex flex-col animate-slide-in-right h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-link/10 text-link flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-body-sm font-semibold text-ink flex items-center gap-2">
                Change Requests
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-bold tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </h2>
              <p className="text-caption text-mute">
                Review proposed code changes
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

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-hairline shrink-0">
          {(
            ["all", "pending", "approved", "rejected"] as StatusFilter[]
          ).map((f) => {
            const count =
              f === "all"
                ? changeRequests?.length ?? 0
                : changeRequests?.filter((cr) => cr.status === f).length ?? 0;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-caption font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-canvas-soft-2 text-ink"
                    : "text-mute hover:text-ink"
                }`}
              >
                {f}
                <span className="ml-1 text-mute/70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-mute">
              <GitPullRequest className="w-8 h-8 opacity-30 mb-2" />
              <p className="text-body-sm">No change requests yet</p>
              <p className="text-caption mt-1">
                Contributors will submit code changes here
              </p>
            </div>
          ) : (
            filtered.map((cr) => {
              const isExpanded = expandedId === cr._id;
              return (
                <div
                  key={cr._id}
                  className="border border-hairline rounded-lg bg-canvas overflow-hidden transition-all"
                >
                  {/* Summary row */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : cr._id)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-canvas-soft-2/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {statusIcon(cr.status)}
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-ink truncate">
                          {cr.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-caption text-mute">
                            <User className="w-3 h-3" />
                            {cr.authorUserName}
                          </span>
                          <span className="text-caption text-mute">
                            {formatTime(cr._creationTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`text-caption font-medium capitalize ${statusLabel(cr.status)}`}
                      >
                        {cr.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-mute" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-mute" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-hairline space-y-3">
                      {/* Diff view */}
                      <div>
                        <p className="text-caption text-mute font-medium mb-1.5">
                          Code Changes
                        </p>
                        <InlineDiff
                          originalCode={cr.originalCode}
                          proposedCode={cr.proposedCode}
                        />
                      </div>

                      {/* Review info or action buttons */}
                      {cr.status === "pending" ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleApprove(
                                cr._id as Id<"changeRequests">
                              )
                            }
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve & Apply
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleReject(
                                cr._id as Id<"changeRequests">
                              )
                            }
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-caption text-mute pt-1">
                          {statusIcon(cr.status)}
                          <span>
                            {cr.status === "approved"
                              ? "Approved"
                              : "Rejected"}{" "}
                            by {cr.reviewedBy}
                            {cr.reviewedAt &&
                              ` at ${formatTime(cr.reviewedAt)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
