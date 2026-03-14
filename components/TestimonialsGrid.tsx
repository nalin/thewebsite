import type { Testimonial } from "@/lib/testimonials-schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TestimonialsGrid({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t) => (
        <div
          key={t.id}
          className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50"
        >
          <p className="text-neutral-300 text-sm leading-relaxed mb-5">
            &ldquo;{t.testimonial}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            {t.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.avatarUrl}
                alt={t.name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {getInitials(t.name)}
              </div>
            )}
            <div>
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-neutral-500">
                {t.role}
                {t.role && t.company ? ", " : ""}
                {t.company}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
