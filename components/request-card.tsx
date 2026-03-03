"use client";

interface RequestCardProps {
  request: {
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
    score: number;
    authorName: string | null;
    authorImage: string | null;
    createdAt: string;
  };
  userVote: number | null;
  onVote: (id: number, value: number) => void;
  isSignedIn: boolean;
}

const statusColors: Record<string, string> = {
  open: "bg-neutral-700 text-neutral-300",
  in_progress: "bg-yellow-900 text-yellow-300",
  deployed: "bg-emerald-900 text-emerald-300",
  rejected: "bg-red-900 text-red-300",
};

export function RequestCard({
  request,
  userVote,
  onVote,
  isSignedIn,
}: RequestCardProps) {
  return (
    <div className="flex gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
      <div className="flex flex-col items-center gap-1 min-w-[3rem]">
        <button
          onClick={() => onVote(request.id, 1)}
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
            request.score > 0
              ? "text-emerald-400"
              : request.score < 0
                ? "text-red-400"
                : "text-neutral-500"
          }`}
        >
          {request.score}
        </span>
        <button
          onClick={() => onVote(request.id, -1)}
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
        </div>
        <h3 className="font-semibold mt-1">{request.title}</h3>
        <p className="text-sm text-neutral-400 mt-1">{request.description}</p>
        <p className="text-xs text-neutral-600 mt-2">
          by {request.authorName ?? "unknown"}
        </p>
      </div>
    </div>
  );
}
