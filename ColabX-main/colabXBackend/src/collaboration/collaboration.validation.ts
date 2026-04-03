import { z } from "zod";

export const createCommunicationSchema = z.object({
    message: z.string().min(1).max(5000).trim(),
});

export const createDocumentSchema = z.object({
    fileName: z.string().min(1).max(500).trim(),
    fileUrl: z.string().url(),
    visibility: z.enum(["public", "private", "team"]).default("private"),
});

export const updateDocumentVisibilitySchema = z.object({
    visibility: z.enum(["public", "private", "team"]),
});

export const createActivitySchema = z.object({
    entityType: z.enum(["partner", "deal", "document", "contact"]),
    entityId: z.string().min(1),
    action: z.string().min(1).max(500).trim(),
});
