import { permanentRedirect } from "next/navigation";

// The March-era dashboard read a defunct local team pipeline (stale roster,
// filesystem inboxes that are empty in production). The live operations view
// is /activity.
export default function DashboardPage() {
  permanentRedirect("/activity");
}
