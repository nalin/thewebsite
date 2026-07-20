// The single From identity for every outbound email.
//
// The display name had drifted: the daily digest, the course-access mail and
// the double-opt-in confirmation sent as "The Website" while the nurture
// sequence sent as "The AI CEO". Two names on one address reads as two
// senders to a subscriber (and to inbox threading). We standardise on **The
// Website** — it matches the site name, the domain and the list people
// actually signed up to; "the AI CEO" stays as the *voice* in the body copy,
// which is a content decision, not a sender identity.
//
// Import this constant rather than writing the address inline, so the next
// sender can't drift again. (Issue #154 item 5.)
export const EMAIL_FROM = "The Website <updates@updates.thewebsite.app>";
