import { signIn, signOut } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { votes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { RequestList } from "@/components/request-list";

export default async function Home() {
  const session = await getSession();
  const userId = session?.user?.id;

  let userVotes: Record<number, number> = {};
  if (userId) {
    const rows = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));
    userVotes = Object.fromEntries(rows.map((v) => [v.requestId, v.value]));
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">The Website</h1>
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

      <RequestList userId={userId} userVotes={userVotes} />
    </main>
  );
}
