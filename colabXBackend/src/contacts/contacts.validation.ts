import { z } from "zod";

export const createContactSchema = z.object({
    name: z.string().min(2).max(200).trim(),
    email: z.string().email(),
    phone: z.string().max(50).trim().optional(),
    role: z.string().max(200).trim().optional(),
    isPrimary: z.boolean().optional(),
});

export const updateContactSchema = z.object({
    name: z.string().min(2).max(200).trim().optional(),
    email: z.string().email().optional(),
    phone: z.string().max(50).trim().nullish(),
    role: z.string().max(200).trim().nullish(),
    isPrimary: z.boolean().optional(),
});
