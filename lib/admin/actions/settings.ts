"use server";

import { db } from "@/database/drizzle";
import { librarySettings } from "@/database/schema";
import { requireAdmin } from "@/lib/admin/guard";
import { APP_NAME } from "@/lib/brand";
import { getLibrarySettings } from "@/lib/settings";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateLibrarySettings = async (input: {
  name: string;
  logoUrl?: string | null;
  loanDays: number;
  emailFrom?: string | null;
}) => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  const loanDays = Math.min(60, Math.max(1, Number(input.loanDays) || 7));
  const current = await getLibrarySettings();

  try {
    if (current.id === "local") {
      await db.insert(librarySettings).values({
        name: input.name.trim() || APP_NAME,
        logoUrl: input.logoUrl || null,
        loanDays,
        emailFrom: input.emailFrom?.trim() || null,
        plan: "FREE",
      });
    } else {
      await db
        .update(librarySettings)
        .set({
          name: input.name.trim() || current.name,
          logoUrl: input.logoUrl ?? current.logoUrl,
          loanDays,
          emailFrom: input.emailFrom?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(librarySettings.id, current.id));
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not save library settings" };
  }
};

export const setPlan = async (plan: "FREE" | "PRO") => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  const current = await getLibrarySettings();
  if (current.id === "local") {
    return { success: false, message: "Run the latest database migration first." };
  }

  await db
    .update(librarySettings)
    .set({ plan, updatedAt: new Date() })
    .where(eq(librarySettings.id, current.id));

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
};
