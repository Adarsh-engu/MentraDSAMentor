import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";
import { generateApiToken } from "@/lib/authUtils";

export const metadata = {
  title: "Analytics | Algo Mentor",
  description: "Track your algorithm solving progress.",
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return <AnalyticsClient userId={session.user.id!} apiToken={await generateApiToken(session.user.id!)} />;
}
