"use client";

import { useState } from "react";

interface RequestCardProps {
  request: {
    issueNumber: number;
    title: string;
    body: string | null;
    type: string;
    status: string;
    authorGithub: string;
    authorAvatar: string | null;
    thumbsUp: number;
    thumbsDown: number;
    htmlUrl: string;
    createdAt: string;
  };
  userVote: number | null;
  onVote: (issueNumber: number, value: number) => void;
  isSignedIn: boolean;
  isAdmin: boolean;
  onApproved?: () => void;
}

const statusColors: Record<string, string> = {
  open: "bg-neutral-700 text-neutral-300",
  accepted: "bg-blue-900 text-blue-300",
  in_progress: "bg-yellow-900 text-yellow-300",
  deployed: "bg-emerald-900 text-emerald-300",
  rejected: "bg-red-900 text-red-300",
};

export function RequestCard({
  request,
  userVote,
  onVote,
  isSignedIn,
  isAdmin,
  onApproved,
}: RequestCardProps) {
  const [approving, setApproving] = useState(false);
  const [approveResult, setApproveResult] = useState<string | null>(null);

  const score = request.thumbsUp - request.thumbsDown;

  async function handleApprove() {
    setApproving(true);
    const res = await fetch(`/api/requests/${request.issueNumber}/approve`, {
      method: "POST",
    });
    if (res.ok) {
      setApproveResult("approved");
      onApproved?.();
    } else {
      const data = await res.json();
      setApproveResult(`Error: ${data.error}`);
    }
    setApproving(false);
  }

  return (
    <div className="flex gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
      <div className="flex flex-col items-center gap-1 min-w-[3rem]">
        <button
          onClick={() => onVote(request.issueNumber, 1)}
          disabled={!isSignedIn}
          className={`text-lg leading-none transition-colors ${
            userVote === 1
              ? "text-emerald-400"
              : "text-neutral-600 hover:text-neutral-300"
          } disabled:cursor-not-allowed`}
          title={isSignedIn ? "Upvote" : "Sign in to vote"}
        >
          ▲
        </button>
        <span
          className={`text-sm font-mono font-bold ${
            score > 0
              ? "text-emerald-400"
              : score < 0
                ? "text-red-400"
                : "text-neutral-500"
          }`}
        >
          {score}
        </span>
        <button
          onClick={() => onVote(request.issueNumber, -1)}
          disabled={!isSignedIn}
          className={`text-lg leading-none transition-colors ${
            userVote === -1
              ? "text-red-400"
              : "text-neutral-600 hover:text-neutral-300"
          } disabled:cursor-not-allowed`}
          title={isSignedIn ? "Downvote" : "Sign in to vote"}
        >
          ▼
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              request.type === "feature"
                ? "bg-emerald-900 text-emerald-300"
                : "bg-red-900 text-red-300"
            }`}
          >
            {request.type}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[request.status]}`}
          >
            {request.status.replace("_", " ")}
          </span>
          <a
            href={request.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            #{request.issueNumber}
          </a>
        </div>
        <h3 className="font-semibold mt-1">{request.title}</h3>
        {request.body && (
          <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
            {request.body}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {request.authorAvatar && (
              <img
                src={request.authorAvatar}
                alt={request.authorGithub}
                className="w-4 h-4 rounded-full"
              />
            )}
            <p className="text-xs text-neutral-600">
              {request.authorGithub}
            </p>
          </div>
          {isAdmin && request.status === "open" && (
            <div>
              {approveResult === "approved" ? (
                <span className="text-xs text-emerald-400">Agent triggered</span>
              ) : (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                >
                  {approving ? "..." : "Approve"}
                </button>
              )}
              {approveResult && approveResult.startsWith("Error") && (
                <span className="text-xs text-red-400 ml-2">{approveResult}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
