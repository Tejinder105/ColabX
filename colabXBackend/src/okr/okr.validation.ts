import { z } from "zod";

// ── Objectives ─────────────────────────────────────────────────────────────

const objectiveAssignmentSchema = z
    .object({
        partnerId: z.string().min(1).optional(),
        teamId: z.string().min(1).optional(),
    })
    .refine(
        (value) =>
            (value.partnerId && !value.teamId) || (!value.partnerId && value.teamId),
        {
            message: "Assign objective to exactly one entity: partnerId or teamId",
            path: ["partnerId"],
        }
    );

export const createObjectiveSchema = z
    .object({
        title: z.string().min(2).max(300).trim(),
        description: z.string().max(2000).trim().optional(),
        startDate: z.string().date(),
        endDate: z.string().date(),
    })
    .and(objectiveAssignmentSchema);

export const updateObjectiveSchema = z
    .object({
        partnerId: z.string().min(1).nullish(),
        teamId: z.string().min(1).nullish(),
        title: z.string().min(2).max(300).trim().optional(),
        description: z.string().max(2000).trim().nullish(),
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
    })
    .refine(
        (value) => {
            const hasPartner = value.partnerId !== undefined;
            const hasTeam = value.teamId !== undefined;

            if (!hasPartner && !hasTeam) {
                return true;
            }

            return (
                (typeof value.partnerId === "string" && value.teamId === null) ||
                (typeof value.teamId === "string" && value.partnerId === null)
            );
        },
        {
            message: "When reassigning, send exactly one assignee and null the other",
            path: ["partnerId"],
        }
    );

// ── Key Results ────────────────────────────────────────────────────────────

export const createKeyResultSchema = z.object({
    title: z.string().min(2).max(300).trim(),
    targetValue: z.number().positive(),
    currentValue: z.number().min(0).optional(),
});

export const updateKeyResultSchema = z.object({
    title: z.string().min(2).max(300).trim().optional(),
    currentValue: z.number().min(0).optional(),
    targetValue: z.number().positive().optional(),
    status: z.enum(["on_track", "at_risk", "off_track"]).optional(),
});

// ── Performance Metrics ────────────────────────────────────────────────────

export const recordMetricSchema = z.object({
    metricType: z.string().min(1).max(100).trim(),
    metricValue: z.number(),
});
