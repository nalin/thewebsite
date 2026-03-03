"use client";

import { useEffect, useState, useCallback } from "react";
import { RequestCard } from "./request-card";
import { RequestForm } from "./request-form";

interface RequestData {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  score: number;
  authorName: string | null;
  authorImage: string | null;
  createdAt: string;
  userId: string;
}

interface Props {
  userId: string | undefined;
  userVotes: Record<number, number>;
}

export function RequestList({ userId, userVotes: initialVotes }: Props) {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [userVotes, setUserVotes] = useState<Record<number, number>>(initialVotes);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/requests");
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleVote(requestId: number, value: number) {
    const res = await fetch(`/api/requests/${requestId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });

    if (res.ok) {
      const data = await res.json();
      setUserVotes((prev) => {
        const next = { ...prev };
        if (data.voted === null) {
          delete next[requestId];
        } else {
          next[requestId] = data.voted;
        }
        return next;
      });
      fetchRequests();
    }
  }

  if (loading) {
    return <p className="text-neutral-500 text-center py-8">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      {userId && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Submit a Request</h2>
          <RequestForm onCreated={fetchRequests} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Requests{" "}
          <span className="text-neutral-500 font-normal text-sm">
            ({requests.length})
          </span>
        </h2>
        {requests.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">
            No requests yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                userVote={userVotes[r.id] ?? null}
                onVote={handleVote}
                isSignedIn={!!userId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
