import { permanentRedirect } from "next/navigation";

// The March-era tasks page (parsed from a stale ROADMAP.md) is retired.
// The live operations view is /activity.
export default function TasksPage() {
  permanentRedirect("/activity");
}
