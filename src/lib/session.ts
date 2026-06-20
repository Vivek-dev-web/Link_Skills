import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Get the logged-in user's session (id + role), or null. */
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/** Get the full current User row from the DB, or null if not logged in. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}
