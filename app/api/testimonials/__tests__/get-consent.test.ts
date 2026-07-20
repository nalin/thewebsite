import { describe, it, expect, vi, beforeEach } from "vitest";

// Issue #154 item 4 (defense in depth): the public GET must never return a row
// that didn't consent to public display, whatever the table happens to contain.
// Drizzle's operators are stubbed so the WHERE clause the route builds is
// inspectable without a database.
vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, value: unknown) => ({ op: "eq", col, value }),
  and: (...conds: unknown[]) => ({ op: "and", conds }),
  desc: (col: unknown) => ({ op: "desc", col }),
}));
vi.mock("@/lib/testimonials-schema", () => ({
  testimonials: { consent: "consent", featured: "featured", createdAt: "createdAt" },
}));

// Hoisted with the vi.mock factory so the query recorder exists before the
// route module is imported.
const { whereCalls, chain } = vi.hoisted(() => {
  const whereCalls: unknown[] = [];
  const chain: Record<string, unknown> = {
    select: () => chain,
    from: () => chain,
    where: (cond: unknown) => {
      whereCalls.push(cond);
      return chain;
    },
    orderBy: () => Promise.resolve([]),
  };
  return { whereCalls, chain };
});
vi.mock("@/lib/testimonials-db", () => ({
  initTestimonialsTable: vi.fn().mockResolvedValue(undefined),
  recordSubmitterEmail: vi.fn().mockResolvedValue(undefined),
  testimonialsDb: chain,
}));
vi.mock("@/lib/session", () => ({ getSession: vi.fn().mockResolvedValue(null) }));

import { GET } from "../route";

const consentFilter = { op: "eq", col: "consent", value: true };

describe("GET /api/testimonials only returns consented rows", () => {
  beforeEach(() => {
    whereCalls.length = 0;
  });

  it("filters on consent for the default listing", async () => {
    await GET(new Request("http://localhost:3000/api/testimonials"));

    expect(whereCalls).toEqual([consentFilter]);
  });

  it("filters on consent AND featured for ?featured=true", async () => {
    await GET(
      new Request("http://localhost:3000/api/testimonials?featured=true")
    );

    expect(whereCalls).toEqual([
      {
        op: "and",
        conds: [consentFilter, { op: "eq", col: "featured", value: true }],
      },
    ]);
  });

  // The regression this pins: the unfiltered branch used to call no where() at
  // all, so a non-consented row inserted by any other path would be published.
  it("never issues an unfiltered public read", async () => {
    await GET(new Request("http://localhost:3000/api/testimonials"));
    await GET(
      new Request("http://localhost:3000/api/testimonials?featured=true")
    );

    expect(whereCalls).toHaveLength(2);
    expect(whereCalls.every((c) => c !== undefined && c !== null)).toBe(true);
  });
});
