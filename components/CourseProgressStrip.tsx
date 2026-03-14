"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCompletedModules } from "@/components/ModuleTracker";

const TOTAL_MODULES = 9;

export default function CourseProgressStrip() {
  const [completed, setCompleted] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isModulePage = /\/course\/module-\d+/.test(pathname ?? "");

  useEffect(() => {
    const modules = getCompletedModules();
    setCompleted(modules.length);
    setMounted(true);
  }, [pathname]);

  if (!mounted || !isModulePage || completed === 0) return null;

  const progress = Math.round((completed / TOTAL_MODULES) * 100);

  return (
    <div className="bg-white border-b border-neutral-100">
      <div className="h-1 bg-neutral-100">
        <div
          className="h-1 bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-1.5 flex justify-between text-xs text-neutral-400">
        <span>Your progress</span>
        <span>
          {completed} / {TOTAL_MODULES} modules complete
        </span>
      </div>
    </div>
  );
}
