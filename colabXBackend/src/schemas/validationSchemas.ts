import { z } from "zod";

// Organization
export const createOrgSchema = z.object({
    name: z.string().min(2).max(100).trim(),
});

export const updateOrgSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
});

// Invitation
export const createInviteSchema = z.object({
    orgId: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "manager", "partner"]).default("partner"),
});

// Member management
export const changeMemberRoleSchema = z.object({
    role: z.enum(["admin", "manager", "partner"]),
});
