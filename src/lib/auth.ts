import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/env";

const isTestMode = process.env.TEST_MODE === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    ...(isTestMode ? [
      CredentialsProvider({
        name: "Test Auth",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (credentials?.username === "testuser" && credentials?.password === "testpass") {
            return {
              id: "test-user-id",
              name: "QA Test User",
              email: "qa@oversight.ai",
              image: "https://github.com/shadcn.png",
            };
          }
          return null;
        }
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token || "mock-access-token";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
});
