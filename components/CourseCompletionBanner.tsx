"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompletedModules, isAllModulesComplete } from "@/components/ModuleTracker";

export default function CourseCompletionBanner() {
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const modules = getCompletedModules();
    setCompletedModules(modules);
    setIsComplete(isAllModulesComplete());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="relative overflow-hidden rounded-xl border border-neutral-600 bg-neutral-900 p-8 text-center">
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-transparent to-neutral-800/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All 8 Modules Complete
            </div>
            <h2 className="text-2xl font-bold mb-2">You've Finished the Course!</h2>
            <p className="text-neutral-400 mb-6">
              Congratulations — you've completed all 8 modules. Download your certificate of completion.
            </p>
            <Link
              href="/course/certificate"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Certificate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (completedModules.length > 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-neutral-300">
              Your Progress
            </p>
            <p className="text-sm text-neutral-500">
              {completedModules.length} / 8 modules
            </p>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedModules.length / 8) * 100}%` }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((m) => {
              const done = completedModules.includes(m);
              return (
                <Link
                  key={m}
                  href={`/course/module-${m}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    done
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                  }`}
                >
                  {m}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
