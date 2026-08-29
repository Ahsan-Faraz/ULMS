import { db } from "@/database/drizzle";
import { staffInvites } from "@/database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import AcceptInviteForm from "@/components/AcceptInviteForm";
import dayjs from "dayjs";

const Page = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const [invite] = await db
    .select()
    .from(staffInvites)
    .where(and(eq(staffInvites.token, token), isNull(staffInvites.acceptedAt)))
    .limit(1);

  if (!invite || dayjs(invite.expiresAt).isBefore(dayjs())) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl font-semibold text-dark-100">
        Join the staff
      </h1>
      <p className="text-light-100">
        {invite.email} is invited as a {invite.role.toLowerCase()}. Set your
        name and password to accept.
      </p>
      <AcceptInviteForm token={token} />
    </div>
  );
};

export default Page;
