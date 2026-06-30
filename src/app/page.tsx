import { auth } from "@/lib/auth";
import ShowcaseClient from "@/components/ShowcaseClient";

export default async function Home() {
  const session = await auth();

  return (
    <ShowcaseClient isAuthenticated={!!session} />
  );
}
