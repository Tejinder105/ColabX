import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db/index.js";
import * as authSchema from "../schemas/authSchema.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  trustedOrigins: ["http://localhost:5173"],

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "http://localhost:3000/api/auth/callback/google",
    },
  },
});