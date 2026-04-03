import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).trim().optional(),
});

export const updateTeamSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).trim().nullish(),
});

export const addTeamMemberSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["lead", "member"]).default("member"),
});

export const updateTeamMemberRoleSchema = z.object({
    role: z.enum(["lead", "member"]),
});
