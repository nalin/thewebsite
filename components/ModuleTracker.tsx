"use client";

import { useEffect } from "react";

const STORAGE_KEY = "course_completed_modules";

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

interface ModuleTrackerProps {
  moduleId: number;
}

export default function ModuleTracker({ moduleId }: ModuleTrackerProps) {
  useEffect(() => {
    markModuleComplete(moduleId);
  }, [moduleId]);

  return null;
}
