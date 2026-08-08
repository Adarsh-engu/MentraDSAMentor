import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TrackerClient from "./TrackerClient";
import { generateApiToken } from "@/lib/authUtils";

export default async function TrackerPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const apiToken = await generateApiToken(session.user.id!);

  return <TrackerClient userId={session.user.id!} apiToken={apiToken} />;
}
