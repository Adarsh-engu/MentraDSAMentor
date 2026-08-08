import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RecommendationsClient from "./RecommendationsClient";
import { generateApiToken } from "@/lib/authUtils";

export default async function RecommendationsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return <RecommendationsClient userId={session.user.id!} apiToken={await generateApiToken(session.user.id!)} />;
}
