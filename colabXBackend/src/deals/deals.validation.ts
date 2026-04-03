import { z } from "zod";

export const createDealSchema = z.object({
    partnerId: z.string().min(1),
    title: z.string().min(2).max(300).trim(),
    description: z.string().max(2000).trim().optional(),
    value: z.number().optional(),
});

export const updateDealSchema = z.object({
    title: z.string().min(2).max(300).trim().optional(),
    description: z.string().max(2000).trim().nullish(),
    value: z.number().nullish(),
    stage: z.enum(["lead", "proposal", "negotiation", "won", "lost"]).optional(),
});

export const assignUserSchema = z.object({
    userId: z.string().min(1),
});

export const createMessageSchema = z.object({
    content: z.string().min(1).max(5000).trim(),
});
