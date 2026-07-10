import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecommendations } from "@/lib/recommender";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { input, domain, userType, userSkills } = await req.json();

  const result = await getRecommendations(
    input ?? "",
    domain ?? "auto",
    userType ?? "student",
    userSkills ?? []
  );

  return NextResponse.json(result);
}
