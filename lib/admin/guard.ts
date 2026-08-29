import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const [user] = await db
    .select({ role: users.role, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized" };
  }

  return { ok: true as const, session, user };
}
