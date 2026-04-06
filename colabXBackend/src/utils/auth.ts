import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db/index.js";
import * as authSchema from "../schemas/authSchema.js";
import config from "../config/config.js";

const authBaseUrl = config.backendUrl;
const trustedOrigins = config.trustedOrigins;

const socialProviders = config.googleOAuth
  ? {
      google: {
        clientId: config.googleOAuth.clientId,
        clientSecret: config.googleOAuth.clientSecret,
        redirectURI: config.googleOAuth.redirectURI,
      },
    }
  : undefined;

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: authBaseUrl,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  trustedOrigins,

  advanced: {
    defaultCookieAttributes: {
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      secure: config.nodeEnv === "production",
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  account: {
    // Local dev OAuth on separate localhost origins can drop the signed
    // state cookie even when the verification row exists.
    skipStateCookieCheck: !config.isProduction,
  },

  socialProviders,
});
