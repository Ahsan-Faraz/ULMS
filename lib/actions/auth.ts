"use server";

import { eq, ilike } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash, compare } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";

const isPublicWorkflowUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return (
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "::1"
    );
  } catch {
    return false;
  }
};

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const [account] = await db
      .select()
      .from(users)
      .where(ilike(users.email, email.trim()))
      .limit(1);

    if (!account) {
      return {
        success: false,
        fieldErrors: { email: "No account found with this email" },
      };
    }

    const isPasswordValid = await compare(password, account.password);

    if (!isPasswordValid) {
      return {
        success: false,
        fieldErrors: { password: "Incorrect password" },
      };
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      redirectTo:
        account.role === "ADMIN" || account.role === "LIBRARIAN"
          ? "/admin"
          : "/home",
    };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      fieldErrors: { email: "An account with this email already exists" },
    };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email: email.trim(),
      universityId,
      password: hashedPassword,
      universityCard,
    });

    const workflowUrl = `${config.env.prodApiEndpoint}/api/workflows/onboarding`;

    if (isPublicWorkflowUrl(workflowUrl)) {
      try {
        await workflowClient.trigger({
          url: workflowUrl,
          body: {
            email,
            fullName,
          },
        });
      } catch (error) {
        console.log(error, "Onboarding workflow skipped");
      }
    } else {
      console.log(
        "Skipping onboarding workflow: QStash cannot reach localhost. Set PROD_API_ENDPOINT to your public Vercel URL to enable emails.",
      );
    }

    await signInWithCredentials({ email, password });

    return { success: true, redirectTo: "/home" };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};
