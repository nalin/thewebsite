"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/testimonials-schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const prev = () =>
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % testimonials.length);

  const t = testimonials[activeIndex];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Card */}
      <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-center min-h-[200px] flex flex-col justify-between">
        <p className="text-neutral-200 text-lg leading-relaxed mb-6">
          &ldquo;{t.testimonial}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          {t.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.avatarUrl}
              alt={t.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {getInitials(t.name)}
            </div>
          )}
          <div className="text-left">
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-xs text-neutral-500">
              {t.role}
              {t.role && t.company ? ", " : ""}
              {t.company}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:border-neutral-500 hover:bg-neutral-800 transition-colors"
            aria-label="Previous testimonial"
          >
            &#8592;
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activeIndex ? "bg-white" : "bg-neutral-600"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:border-neutral-500 hover:bg-neutral-800 transition-colors"
            aria-label="Next testimonial"
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
