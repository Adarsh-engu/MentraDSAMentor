import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AiMentorClient from "./AiMentorClient";
import { generateApiToken } from "@/lib/authUtils";

export default async function AiMentorPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return <AiMentorClient userId={session.user.id!} apiToken={await generateApiToken(session.user.id!)} />;
}
