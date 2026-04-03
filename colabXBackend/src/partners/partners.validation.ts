import { z } from "zod";

/**
 * Transform to normalize email (lowercase + trim)
 */
const normalizedEmail = z.string().email().transform(val => val.toLowerCase().trim());

export const createPartnerSchema = z.object({
    name: z.string().min(2).max(200).trim(),
    type: z.enum(["reseller", "agent", "technology", "distributor"]),
    contactEmail: normalizedEmail,
    industry: z.string().max(200).trim().optional(),
    onboardingDate: z.string().datetime().optional(),
});

export const updatePartnerSchema = z.object({
    name: z.string().min(2).max(200).trim().optional(),
    type: z.enum(["reseller", "agent", "technology", "distributor"]).optional(),
    status: z.enum(["pending", "active", "inactive", "suspended"]).optional(),
    contactEmail: normalizedEmail.nullish(),
    industry: z.string().max(200).trim().nullish(),
    onboardingDate: z.string().datetime().nullish(),
});
