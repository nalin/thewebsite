import { permanentRedirect } from "next/navigation";

// /free-guide and /starter-kit were two near-identical lead-magnet pages
// selling the same "Starter Kit" as an emailed deliverable that was never
// sent (issue #150). The kit content now lives on /starter-kit itself, so
// this page folds into it permanently. Old links and the waitlist redirect
// still land somewhere truthful.
export default function FreeGuidePage() {
  permanentRedirect("/starter-kit");
}
