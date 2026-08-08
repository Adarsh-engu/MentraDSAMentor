import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { generateApiToken } from "@/lib/authUtils";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  // Pass userId to the client component to fetch data
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center pb-6 border-b border-outline-variant/20">
        <div>
          <h1 className="text-3xl font-display-lg text-on-surface">
            {session.user.name}'s Profile
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">Track your algorithm mastery and consistency.</p>
        </div>
      </header>

      <ProfileClient userId={session.user.id as string} apiToken={await generateApiToken(session.user.id as string)} />
    </div>
  );
}
