import { NextRequest, NextResponse } from "next/server";
import { lookupIsbn } from "@/lib/isbn";
import { isPro } from "@/lib/settings";
import { requireStaff } from "@/lib/admin/guard";

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro())) {
    return NextResponse.json(
      { error: "ISBN lookup is a Campus Pro feature." },
      { status: 402 },
    );
  }

  const isbn = request.nextUrl.searchParams.get("isbn") ?? "";
  const book = await lookupIsbn(isbn);

  if (!book) {
    return NextResponse.json({ error: "No book found for that ISBN." }, { status: 404 });
  }

  return NextResponse.json(book);
}
