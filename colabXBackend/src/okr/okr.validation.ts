import { z } from "zod";

// ── Objectives ─────────────────────────────────────────────────────────────

export const createObjectiveSchema = z.object({
    partnerId: z.string().min(1),
    title: z.string().min(2).max(300).trim(),
    description: z.string().max(2000).trim().optional(),
    startDate: z.string().date(),
    endDate: z.string().date(),
});

export const updateObjectiveSchema = z.object({
    partnerId: z.string().min(1).optional(),
    title: z.string().min(2).max(300).trim().optional(),
    description: z.string().max(2000).trim().nullish(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
});

// ── Key Results ────────────────────────────────────────────────────────────

export const createKeyResultSchema = z.object({
    targetValue: z.number().positive(),
    currentValue: z.number().min(0).optional(),
    status: z.enum(["on_track", "at_risk", "off_track"]).optional(),
});

export const updateKeyResultSchema = z.object({
    currentValue: z.number().min(0).optional(),
    targetValue: z.number().positive().optional(),
    status: z.enum(["on_track", "at_risk", "off_track"]).optional(),
});

// ── Performance Metrics ────────────────────────────────────────────────────

export const recordMetricSchema = z.object({
    metricType: z.string().min(1).max(100).trim(),
    metricValue: z.number(),
});
