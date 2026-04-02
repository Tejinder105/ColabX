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
  baseURL: authBaseUrl,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  trustedOrigins,

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders,
});