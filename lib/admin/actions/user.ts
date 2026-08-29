"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { requireAdmin } from "@/lib/admin/guard";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/workflow";
import { APP_NAME } from "@/lib/brand";

const revalidateUsers = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/account-requests");
};

export const updateAccountStatus = async (
  userId: string,
  status: "APPROVED" | "REJECTED",
) => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  try {
    const [user] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return { success: false, message: "User not found" };

    await db.update(users).set({ status }).where(eq(users.id, userId));

    try {
      await sendEmail({
        email: user.email,
        subject:
          status === "APPROVED"
            ? `Your ${APP_NAME} account was approved`
            : `Your ${APP_NAME} account request was declined`,
        message:
          status === "APPROVED"
            ? `<p>Hi ${user.fullName},</p><p>Your library account has been approved. You can now borrow books from ${APP_NAME}.</p>`
            : `<p>Hi ${user.fullName},</p><p>Your ${APP_NAME} account request was not approved. Please contact the library if you think this is a mistake.</p>`,
      });
    } catch (error) {
      console.log(error, "Account status email skipped");
    }

    revalidateUsers();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not update account status" };
  }
};

export const updateUserRole = async (
  userId: string,
  role: "USER" | "ADMIN" | "LIBRARIAN",
) => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  try {
    if (admin.session.user?.id === userId && role === "USER") {
      return { success: false, message: "You cannot remove your own admin role" };
    }

    if (role === "USER") {
      const [admins] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, "ADMIN"), eq(users.status, "APPROVED")));

      const [target] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (target?.role === "ADMIN" && admins.value <= 1) {
        return { success: false, message: "At least one admin is required" };
      }
    }

    await db
      .update(users)
      .set({
        role,
        ...((role === "ADMIN" || role === "LIBRARIAN")
          ? { status: "APPROVED" as const }
          : {}),
      })
      .where(eq(users.id, userId));

    revalidateUsers();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not update user role" };
  }
};
