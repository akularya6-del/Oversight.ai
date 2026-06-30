/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/AuthButtons";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  // NOTE: isDemo logic is kept in the page components, but we could pass it or read it if needed. 
  // For simplicity, we'll assume demo mode check happens in the page. 
  // If we need the demo badge here, we would need to read headers or cookies, but we can just omit the badge in the layout or read it from a client component.
  // We'll omit the demo badge in the layout for now and keep the profile.

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2A2A2A]/40 sticky top-0 z-50 bg-[#09090B]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between w-full">
          
          {/* Wordmark & Badge */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex gap-1 items-center h-5 w-5">
                <img src="/logo.png" alt="Oversight Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold tracking-[0.2em] uppercase text-sm text-[#FAFAFA]">
                Oversight<span className="text-[#10B981] animate-[pulse_1.5s_ease-in-out_infinite]">|</span>
              </span>
            </Link>

            {/* Mode Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 leading-none mb-0.5">Live Mode</span>
                <span className="text-[9px] text-[#FAFAFA]/50 uppercase tracking-wider leading-none">Connected to Google Workspace</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? "User"}
                      width={28}
                      height={28}
                      className="rounded-full ring-1 ring-[#2A2A2A] shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#111113] border border-[#2A2A2A] flex items-center justify-center text-[10px] font-bold text-[#FAFAFA]/80 shadow-sm">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#FAFAFA]/90 hidden sm:block truncate max-w-[150px]">
                    {user.name}
                  </span>
                </div>
                <div className="h-4 w-px bg-[#2A2A2A]" />
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
