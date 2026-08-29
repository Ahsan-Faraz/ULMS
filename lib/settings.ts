import { db } from "@/database/drizzle";
import { librarySettings } from "@/database/schema";
import { APP_NAME } from "@/lib/brand";

export const FREE_BOOK_LIMIT = 500;
export const FINE_PER_DAY = 1;

export type LibrarySettings = {
  id: string;
  name: string;
  logoUrl: string | null;
  loanDays: number;
  emailFrom: string | null;
  plan: "FREE" | "PRO";
  stripeCustomerId: string | null;
};

const fallbackSettings = (): LibrarySettings => ({
  id: "local",
  name: APP_NAME,
  logoUrl: null,
  loanDays: 7,
  emailFrom: null,
  plan: "FREE",
  stripeCustomerId: null,
});

export async function getLibrarySettings(): Promise<LibrarySettings> {
  try {
    const [row] = await db.select().from(librarySettings).limit(1);
    if (row) {
      const name = row.name === "Folio" || !row.name ? APP_NAME : row.name;
      return {
        id: row.id,
        name,
        logoUrl: row.logoUrl,
        loanDays: row.loanDays,
        emailFrom: row.emailFrom,
        plan: row.plan,
        stripeCustomerId: row.stripeCustomerId,
      };
    }

    const [created] = await db
      .insert(librarySettings)
      .values({
        name: APP_NAME,
        loanDays: 7,
        plan: "FREE",
      })
      .returning();

    return {
      id: created.id,
      name: created.name,
      logoUrl: created.logoUrl,
      loanDays: created.loanDays,
      emailFrom: created.emailFrom,
      plan: created.plan,
      stripeCustomerId: created.stripeCustomerId,
    };
  } catch (error) {
    console.log(error, "Library settings fallback");
    return fallbackSettings();
  }
}

export async function isPro() {
  const settings = await getLibrarySettings();
  return settings.plan === "PRO";
}

export async function getBranding() {
  const settings = await getLibrarySettings();
  const pro = settings.plan === "PRO";

  return {
    name: pro && settings.name ? settings.name : APP_NAME,
    logoUrl: pro ? settings.logoUrl : null,
    emailFrom: pro ? settings.emailFrom : null,
    loanDays: settings.loanDays || 7,
    plan: settings.plan,
  };
}
