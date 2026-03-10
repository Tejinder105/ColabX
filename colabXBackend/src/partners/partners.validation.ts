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

export const assignTeamSchema = z.object({
    teamId: z.string().min(1),
});

export const addPartnerUserSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["partner_admin", "partner_member"]).default("partner_member"),
});

export const updatePartnerUserRoleSchema = z.object({
    role: z.enum(["partner_admin", "partner_member"]),
});
