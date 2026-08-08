import { MentraLayout } from "@/components/MentraLayout";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <MentraLayout user={session?.user}>{children}</MentraLayout>;
}
