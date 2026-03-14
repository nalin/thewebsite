"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
  currentStatus: string;
}

export function AdminTestimonialActions({ id, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "published" && (
        <button
          onClick={() => updateStatus("published")}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-green-700 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
        >
          Publish
        </button>
      )}
      {currentStatus !== "approved" && currentStatus !== "published" && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}
      {currentStatus === "published" && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors disabled:opacity-50"
        >
          Unpublish
        </button>
      )}
      {currentStatus !== "rejected" && (
        <button
          onClick={() => updateStatus("rejected")}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-red-900 hover:bg-red-800 text-white rounded transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      )}
      {currentStatus === "rejected" && (
        <button
          onClick={() => updateStatus("pending")}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors disabled:opacity-50"
        >
          Restore
        </button>
      )}
    </div>
  );
}
