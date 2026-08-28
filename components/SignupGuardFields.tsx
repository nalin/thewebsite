import { formToken, FORM_TOKEN_FIELD, HONEYPOT_FIELD } from "@/lib/form-guard";

// Hidden anti-spam fields for every form that posts to /api/waitlist or
// /api/course/access (issue #203). Server component: the token is rendered
// into the HTML, so submitting requires having fetched a page first.
//
// The honeypot is hidden by offscreen positioning rather than
// display:none/type=hidden — form-filling bots skip fields they can detect as
// hidden, and this style is harder to classify. tabIndex/aria-hidden keep it
// out of keyboard and screen-reader flows, and autoComplete="off" keeps
// browser autofill from tripping real visitors.
export function SignupGuardFields() {
  return (
    <>
      <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken()} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label>
          Leave this field empty
          <input
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
    </>
  );
}
