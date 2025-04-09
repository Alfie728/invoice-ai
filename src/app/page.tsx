import Link from "next/link";
import { auth, signIn, signOut } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  // // Use the new syncIfNeeded method
  // if (session) {
  //   await api.sync.startInitialSync();
  //   await api.sync.setupGmailWatch({
  //     labelIds: [
  //       "CATEGORY_FORUMS",
  //       "CATEGORY_PERSONAL",
  //       "CATEGORY_PROMOTIONS",
  //       "CATEGORY_SOCIAL",
  //       "CATEGORY_UPDATES",
  //       "CHAT",
  //       "DRAFT",
  //       "IMPORTANT",
  //       "INBOX",
  //       "SENT",
  //       "SPAM",
  //       "STARRED",
  //       "TRASH",
  //       "UNREAD",
  //     ],
  //   });
  // }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            {!session ? (
              <form
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/" });
                }}
              >
                <button type="submit">Sign in</button>
              </form>
            ) : (
              <form
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit">Sign out</button>
              </form>
            )}
          </div>
          <Link
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </HydrateClient>
  );
}