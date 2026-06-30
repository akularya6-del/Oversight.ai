import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: { demo?: string };
}) {
  const isDemo = searchParams.demo === "true";
  const session = await auth();

  if (!session?.user && !isDemo) {
    redirect("/");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-on-surface mb-4">Follow-ups</h1>
      <div className="bg-surface-container border border-outline-variant rounded-xl p-6 shadow-sm">
        <p className="text-on-surface-variant">Your pending follow-ups will appear here.</p>
      </div>
    </div>
  );
}
