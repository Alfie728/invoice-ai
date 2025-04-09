import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  type DefaultSession,
  type NextAuthConfig,
  type Session,
  type User,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/server/db";
import { env } from "@/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
    error?: "RefreshTokenError";
    accessToken?: string;
    account?: {
      id: string;
      provider: string;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

interface GoogleTokensResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://mail.google.com/",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      const [googleAccount] = await db.account.findMany({
        where: { userId: user.id, provider: "google" },
      });

      // Set the access token in the session
      session.accessToken = googleAccount?.access_token ?? undefined;

      // Include account information in the session
      if (googleAccount) {
        session.account = {
          id: googleAccount.id,
          provider: googleAccount.provider,
        };
      }

      const expiresAt = googleAccount?.expires_at ?? 0;
      if (expiresAt < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          // https://accounts.google.com/.well-known/openid-configuration
          // We need the `token_endpoint`.
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: env.AUTH_GOOGLE_ID,
              client_secret: env.AUTH_GOOGLE_SECRET,
              grant_type: "refresh_token",
              refresh_token: googleAccount?.refresh_token ?? "",
            }),
          });

          const tokensOrError = (await response.json()) as GoogleTokensResponse;
          if (!response.ok) throw new Error(tokensOrError.error);

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          await db.account.update({
            data: {
              access_token: newTokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
              refresh_token:
                newTokens.refresh_token ?? googleAccount?.refresh_token,
            },
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: googleAccount?.providerAccountId ?? "",
              },
            },
          });
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          session.error = "RefreshTokenError";
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
