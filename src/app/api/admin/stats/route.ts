import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, jobs, posts, reports, connections, companies] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.post.count(),
    prisma.report.count({ where: { resolved: false } }),
    prisma.connection.count({ where: { status: "ACCEPTED" } }),
    prisma.company.count(),
  ]);

  const newUsersToday = await prisma.user.count({
    where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
  });
  const newJobsToday = await prisma.job.count({
    where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
  });

  return NextResponse.json({ users, jobs, posts, reports, connections, companies, newUsersToday, newJobsToday });
}
