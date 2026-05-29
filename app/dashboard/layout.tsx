import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Protects the whole /dashboard area. Middleware already redirects signed-out
 * users, but we re-check here (defense in depth) and use the user for the header.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            NEDC
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-foreground/60 sm:inline">
              {user.email}
            </span>
            {/* Sign out is a POST so a stray link/prefetch can't trigger it. */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-foreground/15 px-4 py-2 font-medium transition hover:bg-foreground/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
