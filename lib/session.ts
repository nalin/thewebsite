import { cookies } from "next/headers";
import { db } from "./db";
import { sessions, users, accounts } from "./schema";
import { eq, and, gt } from "drizzle-orm";
import { isAdmin } from "./admin";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) return null;

  const result = await db
    .select({
      userId: sessions.userId,
      expires: sessions.expires,
      userName: users.name,
      userImage: users.image,
      githubUsername: users.githubUsername,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.sessionToken, sessionToken),
        gt(sessions.expires, new Date())
      )
    )
    .get();

  if (!result) return null;

  // Check if admin
  const account = await db
    .select({ providerAccountId: accounts.providerAccountId })
    .from(accounts)
    .where(eq(accounts.userId, result.userId))
    .get();

  return {
    user: {
      id: result.userId,
      name: result.userName,
      image: result.userImage,
      githubUsername: result.githubUsername,
      isAdmin: isAdmin(account?.providerAccountId),
    },
  };
}
