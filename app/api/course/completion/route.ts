import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const TOTAL_MODULES = 8;
const ALL_MODULE_IDS = Array.from({ length: TOTAL_MODULES }, (_, i) => i + 1);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { completedModules } = body as { completedModules: number[] };

    if (!Array.isArray(completedModules)) {
      return NextResponse.json({ error: "completedModules must be an array" }, { status: 400 });
    }

    const validModules = completedModules.filter(
      (m) => typeof m === "number" && m >= 1 && m <= TOTAL_MODULES
    );
    const uniqueModules = [...new Set(validModules)];
    const complete = ALL_MODULE_IDS.every((id) => uniqueModules.includes(id));

    const session = await getSession();
    const userName = session?.user?.name ?? null;

    return NextResponse.json({
      complete,
      completedCount: uniqueModules.length,
      totalModules: TOTAL_MODULES,
      userName,
      completedAt: complete ? new Date().toISOString() : null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    totalModules: TOTAL_MODULES,
    moduleIds: ALL_MODULE_IDS,
    userName: session?.user?.name ?? null,
  });
}
