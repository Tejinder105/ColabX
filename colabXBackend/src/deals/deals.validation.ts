import { z } from "zod";

export const createDealSchema = z.object({
    partnerId: z.string().min(1),
    teamId: z.string().min(1),
    title: z.string().min(2).max(300).trim(),
    description: z.string().max(2000).trim().optional(),
    value: z.number().optional(),
});

export const updateDealSchema = z.object({
    teamId: z.string().min(1).optional(),
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

export const createDealTaskSchema = z.object({
    title: z.string().min(2).max(300).trim(),
    description: z.string().max(2000).trim().optional(),
    assigneeUserId: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
});

export const updateDealTaskSchema = z.object({
    title: z.string().min(2).max(300).trim().optional(),
    description: z.string().max(2000).trim().nullish(),
    assigneeUserId: z.string().min(1).nullish(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    dueDate: z.string().datetime().nullish(),
});

export const createDealDocumentSchema = z.object({
    fileName: z.string().min(1).max(300).trim(),
    fileUrl: z.string().url(),
    visibility: z.enum(["shared", "internal"]).optional(),
});
