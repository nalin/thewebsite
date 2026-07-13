import { permanentRedirect } from "next/navigation";

// The March-era metrics page mixed live counts with stale launch-era claims
// (fabricated task totals, "5 modules", a future March 23 launch). Truthful
// public numbers now live on /activity.
export default function MetricsPage() {
  permanentRedirect("/activity");
}
