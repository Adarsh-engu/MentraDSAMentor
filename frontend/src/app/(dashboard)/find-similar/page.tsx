import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FindSimilarClient from "./FindSimilarClient";
import { generateApiToken } from "@/lib/authUtils";

export const metadata = {
  title: "Find Similar | Mentra",
};

export default async function FindSimilarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full mt-20 lg:mt-0 lg:ml-64">
      <div className="mb-8">
        <h1 className="font-headline-md text-3xl font-bold tracking-tight text-on-surface">Semantic Search</h1>
        <p className="text-on-surface-variant mt-2 text-sm max-w-3xl">
          Instantly find mathematically similar problems based on conceptual patterns. Select a problem you've already solved to discover identical algorithmic structures to practice.
        </p>
      </div>
      
      <FindSimilarClient userId={session.user.id!} apiToken={await generateApiToken(session.user.id!)} />
    </div>
  );
}
