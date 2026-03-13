import { z } from "zod";

export const createPartnerSchema = z.object({
    name: z.string().min(2).max(200).trim(),
    type: z.enum(["reseller", "agent", "technology", "distributor"]),
    contactEmail: z.string().email().optional(),
    industry: z.string().max(200).trim().optional(),
    onboardingDate: z.string().datetime().optional(),
});

export const updatePartnerSchema = z.object({
    name: z.string().min(2).max(200).trim().optional(),
    type: z.enum(["reseller", "agent", "technology", "distributor"]).optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    contactEmail: z.string().email().nullish(),
    industry: z.string().max(200).trim().nullish(),
    onboardingDate: z.string().datetime().nullish(),
});
