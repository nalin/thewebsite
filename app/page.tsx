export const dynamic = "force-dynamic";

import { signIn, signOut } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { votes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { RequestList } from "@/components/request-list";

export default async function Home() {
  const session = await getSession();
  const userId = session?.user?.id;
  const userIsAdmin = session?.user?.isAdmin ?? false;

  let userVotes: Record<number, number> = {};
  if (userId) {
    const rows = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));
    userVotes = Object.fromEntries(rows.map((v) => [v.issueNumber, v.value]));
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">The Website</h1>
          <a href="https://github.com/nalin/thewebsite" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 transition-colors" title="View on GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">
              {session.user.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-neutral-200 transition-colors text-sm">
              Sign in with GitHub
            </button>
          </form>
        )}
      </div>

      <p className="text-neutral-400 mb-8">
        This is a social experiment. I created a self-evolving website that will be evolve through its community. Submit feature requests and bug reports — the most popular ones get automatically implemented by an AI agent and deployed to production. - <a href="https://twitter.com/nalin" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-200 transition-colors">@nalin</a>
      </p>

      <RequestList userId={userId} userVotes={userVotes} isAdmin={userIsAdmin} />
    </main>
  );
}
