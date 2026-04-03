import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    FRONTEND_URL: z.string().url().optional(),
    CORS_ORIGINS: z.string().optional(),
    TRUSTED_ORIGINS: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    BACKEND_URL: z.string().url().optional(),
    APP_URL: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),
    BREVO_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    EMAIL_FROM_NAME: z.string().optional(),
});

const env = envSchema.parse(process.env);

const commaSeparatedToArray = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const corsOrigins = commaSeparatedToArray(env.CORS_ORIGINS);
const trustedOrigins = commaSeparatedToArray(env.TRUSTED_ORIGINS);

const frontendUrl = env.FRONTEND_URL ?? "http://localhost:5173";
const backendUrl = env.BETTER_AUTH_URL ?? env.BACKEND_URL ?? `http://localhost:${env.PORT}`;

const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === "production",
    databaseUrl: env.DATABASE_URL,
    backendUrl,
    corsOrigins: corsOrigins.length ? corsOrigins : [frontendUrl],
    trustedOrigins: trustedOrigins.length ? trustedOrigins : [frontendUrl],
    googleOAuth:
        env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
            ? {
                  clientId: env.GOOGLE_CLIENT_ID,
                  clientSecret: env.GOOGLE_CLIENT_SECRET,
                  redirectURI: env.GOOGLE_REDIRECT_URI ?? `${backendUrl}/api/auth/callback/google`,
              }
            : undefined,
};

export default config;