"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAllModulesComplete, getCompletedModules } from "@/components/ModuleTracker";

interface CertificateClientProps {
  userName: string;
  completedAt: string;
}

export default function CertificateClient({ userName, completedAt }: CertificateClientProps) {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const complete = isAllModulesComplete();
    const modules = getCompletedModules();
    setIsComplete(complete);
    setCompletedCount(modules.length);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isComplete === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!isComplete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link href="/course" className="text-sm text-neutral-600 hover:text-neutral-900">
              ← Back to Course
            </Link>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Certificate Not Yet Earned
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You've completed <strong>{completedCount} of 8</strong> modules.
            Finish all 8 modules to earn your certificate.
          </p>
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((m) => {
              const done = getCompletedModules().includes(m);
              return (
                <Link
                  key={m}
                  href={`/course/module-${m}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    done
                      ? "bg-green-500 text-white"
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                  }`}
                >
                  {m}
                </Link>
              );
            })}
          </div>
          <Link
            href="/course"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .certificate-wrapper { padding: 0 !important; min-height: auto !important; }
        }
      `}</style>

      <div className="certificate-wrapper min-h-screen bg-neutral-100 py-12">
        {/* Controls - hidden on print */}
        <div className="no-print max-w-4xl mx-auto px-6 mb-8 flex items-center justify-between">
          <Link href="/course" className="text-sm text-neutral-600 hover:text-neutral-900">
            ← Back to Course
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Certificate */}
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="bg-white relative overflow-hidden"
            style={{
              border: "2px solid #e5e7eb",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              padding: "64px 80px",
              minHeight: "600px",
            }}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-black" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-black" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-black" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-black" />

            {/* Certificate content */}
            <div className="text-center relative z-10">
              {/* Logo / brand */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black rounded-full">
                  <span className="text-xl font-black tracking-tight">The Website</span>
                </div>
              </div>

              {/* Certificate title */}
              <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase mb-3">
                Certificate of Completion
              </p>
              <h1
                className="font-black text-gray-900 mb-6"
                style={{ fontSize: "42px", letterSpacing: "-0.02em", lineHeight: 1.1 }}
              >
                Build Your Own AI Agent
              </h1>

              {/* Divider */}
              <div className="flex items-center gap-4 justify-center mb-8">
                <div className="h-px bg-neutral-300 flex-1" />
                <div className="w-2 h-2 bg-black rotate-45" />
                <div className="h-px bg-neutral-300 flex-1" />
              </div>

              {/* Awarded to */}
              <p className="text-sm text-neutral-500 uppercase tracking-widest mb-3">
                Awarded to
              </p>
              <p
                className="font-bold text-gray-900 mb-8"
                style={{ fontSize: "38px", fontFamily: "Georgia, serif", letterSpacing: "-0.01em" }}
              >
                {userName}
              </p>

              {/* Description */}
              <p className="text-gray-600 max-w-xl mx-auto mb-10 leading-relaxed">
                For successfully completing all 8 modules of the{" "}
                <strong>Build Your Own AI Agent</strong> course, demonstrating mastery of
                autonomous AI agent architecture, development, multi-agent systems, and
                production deployment.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 justify-center mb-10">
                <div className="h-px bg-neutral-300 flex-1" />
                <div className="w-2 h-2 bg-black rotate-45" />
                <div className="h-px bg-neutral-300 flex-1" />
              </div>

              {/* Date and signature row */}
              <div className="flex items-end justify-between">
                <div className="text-left">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">
                    Date Completed
                  </p>
                  <p className="text-gray-900 font-semibold">{completedAt}</p>
                </div>

                {/* Modules badge */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center">
                    <span className="text-xs font-black">8/8</span>
                  </div>
                  <p className="text-xs text-neutral-400">Modules</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">
                    Issued by
                  </p>
                  <p
                    className="text-gray-900"
                    style={{ fontFamily: "Georgia, serif", fontSize: "20px" }}
                  >
                    The Website AI CEO
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share / actions below certificate - no print */}
        <div className="no-print max-w-4xl mx-auto px-6 mt-8 text-center">
          <p className="text-neutral-500 text-sm mb-4">
            Congratulations on completing the course! Use your browser's print dialog to save as PDF.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePrint}
              className="text-sm text-neutral-600 underline hover:text-neutral-900"
            >
              Print / Save as PDF
            </button>
            <span className="text-neutral-300">|</span>
            <Link
              href="/course"
              className="text-sm text-neutral-600 underline hover:text-neutral-900"
            >
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
