import { db } from "./db";
import { purchases } from "./schema";
import { eq, and } from "drizzle-orm";
import { COURSE_PRODUCT_ID } from "./stripe";

export async function hasPurchasedCourse(userId: string): Promise<boolean> {
  const purchase = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        eq(purchases.status, "completed"),
        eq(purchases.productId, COURSE_PRODUCT_ID)
      )
    )
    .get();

  return !!purchase;
}
