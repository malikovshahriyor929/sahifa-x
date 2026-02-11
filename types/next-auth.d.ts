import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession["user"];
    error?: string;
  }

  interface User {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}
