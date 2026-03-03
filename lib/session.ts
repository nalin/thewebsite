import { cookies } from "next/headers";
import { db } from "./db";
import { sessions, users } from "./schema";
import { eq, and, gt } from "drizzle-orm";

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

  return {
    user: {
      id: result.userId,
      name: result.userName,
      image: result.userImage,
    },
  };
}
