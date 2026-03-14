"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "course_completed_modules";
const SESSION_KEY = "course_session_id";

export function getCompletedModules(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markModuleComplete(moduleId: number): void {
  if (typeof window === "undefined") return;
  const existing = getCompletedModules();
  if (!existing.includes(moduleId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, moduleId]));
  }
}

export function isAllModulesComplete(): boolean {
  const completed = getCompletedModules();
  for (let i = 1; i <= 8; i++) {
    if (!completed.includes(i)) return false;
  }
  return true;
}

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_KEY, newId);
    return newId;
  } catch {
    return `anon-${Date.now()}`;
  }
}

function reportProgress(sessionId: string, moduleId: number, timeSpent: number) {
  const payload = JSON.stringify({ moduleId, timeSpent, sessionId });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/course/progress",
      new Blob([payload], { type: "application/json" })
    );
  } else {
    fetch("/api/course/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

interface ModuleTrackerProps {
  moduleId: number;
}

export default function ModuleTracker({ moduleId }: ModuleTrackerProps) {
  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    startTimeRef.current = Date.now();
    sessionIdRef.current = getOrCreateSessionId();
    markModuleComplete(moduleId);

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      reportProgress(sessionIdRef.current, moduleId, timeSpent);
    };
  }, [moduleId]);

  return null;
}
