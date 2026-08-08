import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { generateApiToken } from "@/lib/authUtils";

export const metadata = {
  title: "Settings | Mentra",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 lg:p-8">
      <header className="pb-6 border-b border-outline-variant/20">
        <h1 className="text-3xl font-display-lg text-on-surface tracking-tight">Settings</h1>
        <p className="text-on-surface-variant font-body-md mt-1">Manage your bio, connected platforms, and preferences.</p>
      </header>

      <SettingsClient userId={session.user.id as string} apiToken={await generateApiToken(session.user.id as string)} />
    </div>
  );
}
