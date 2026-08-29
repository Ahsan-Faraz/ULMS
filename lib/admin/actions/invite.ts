"use server";

import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { db } from "@/database/drizzle";
import { staffInvites, users } from "@/database/schema";
import { requireAdmin } from "@/lib/admin/guard";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/workflow";
import { appUrl, staffInviteEmail } from "@/lib/email";
import dayjs from "dayjs";

export const inviteStaff = async (email: string, role: "ADMIN" | "LIBRARIAN") => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) {
    return { success: false, message: "Enter a valid email" };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, trimmed))
    .limit(1);

  if (existing) {
    return { success: false, message: "That email already has an account" };
  }

  const token = randomBytes(24).toString("hex");

  await db.insert(staffInvites).values({
    email: trimmed,
    role,
    token,
    invitedBy: admin.session.user?.id,
    expiresAt: dayjs().add(7, "day").toDate(),
  });

  try {
    await sendEmail({
      email: trimmed,
      subject: "You are invited to Folio staff",
      message: staffInviteEmail({
        role: role === "ADMIN" ? "Admin" : "Librarian",
        inviteUrl: `${appUrl()}/invite/${token}`,
      }),
    });
  } catch (error) {
    console.log(error, "Staff invite email skipped");
  }

  revalidatePath("/admin/settings");
  return { success: true };
};

export const listInvites = async () => {
  const admin = await requireAdmin();
  if (!admin.ok) return [];

  return db
    .select()
    .from(staffInvites)
    .where(isNull(staffInvites.acceptedAt))
    .orderBy(desc(staffInvites.createdAt));
};

export const acceptStaffInvite = async ({
  token,
  fullName,
  password,
}: {
  token: string;
  fullName: string;
  password: string;
}) => {
  const [invite] = await db
    .select()
    .from(staffInvites)
    .where(and(eq(staffInvites.token, token), isNull(staffInvites.acceptedAt)))
    .limit(1);

  if (!invite) return { success: false, error: "This invite is invalid." };
  if (dayjs(invite.expiresAt).isBefore(dayjs())) {
    return { success: false, error: "This invite has expired." };
  }

  if (fullName.trim().length < 3 || password.length < 8) {
    return {
      success: false,
      error: "Name must be at least 3 characters and password at least 8.",
    };
  }

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, invite.email))
    .limit(1);

  if (taken) return { success: false, error: "An account already exists." };

  const hashedPassword = await hash(password, 10);
  let universityId = Number(String(Date.now()).slice(-8));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await db.insert(users).values({
        fullName: fullName.trim(),
        email: invite.email,
        universityId,
        password: hashedPassword,
        universityCard: "staff-invite",
        status: "APPROVED",
        role: invite.role,
      });
      break;
    } catch (error) {
      universityId += 1;
      if (attempt === 4) {
        console.log(error);
        return { success: false, error: "Could not create the staff account." };
      }
    }
  }

  await db
    .update(staffInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(staffInvites.id, invite.id));

  return { success: true, email: invite.email };
};
