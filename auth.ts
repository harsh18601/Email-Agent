import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

type TokenWithOAuth = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  provider?: string;
  error?: string;
};

async function refreshGoogleAccessToken(token: TokenWithOAuth): Promise<TokenWithOAuth> {
  if (!token.refreshToken) {
    return { ...token, error: "MissingRefreshToken" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID || "",
        client_secret: process.env.AUTH_GOOGLE_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh Google access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider;
        return token;
      }

      if (token.provider !== "google") {
        return token;
      }

      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      return refreshGoogleAccessToken(token as TokenWithOAuth);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
       session.error = token.error;
      return session;
    },
  },
});
