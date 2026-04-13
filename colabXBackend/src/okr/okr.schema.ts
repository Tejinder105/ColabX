import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    date,
    real,
    index,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";
import { team } from "../teams/teams.schema.js";

export const keyResultStatusEnum = pgEnum("keyResultStatus", [
    "on_track",
    "at_risk",
    "off_track",
]);

// ── Objective table ────────────────────────────────────────────────────────

export const objective = pgTable(
    "objective",
    {
        objectiveId: text("objectiveId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        partnerId: text("partnerId").references(() => partner.partnerId, { onDelete: "cascade" }),
        teamId: text("teamId").references(() => team.teamId, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        startDate: date("startDate").notNull(),
        endDate: date("endDate").notNull(),
        createdByUserId: text("createdByUserId").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("objective_organizationId_idx").on(table.organizationId),
        index("objective_partnerId_idx").on(table.partnerId),
        index("objective_teamId_idx").on(table.teamId),
    ]
);

// ── Key Result table ───────────────────────────────────────────────────────

export const keyResult = pgTable(
    "keyResult",
    {
        keyResultId: text("keyResultId").primaryKey(),
        objectiveId: text("objectiveId")
            .notNull()
            .references(() => objective.objectiveId, { onDelete: "cascade" }),
        title: text("title").notNull(),
        targetValue: real("targetValue").notNull(),
        currentValue: real("currentValue").notNull().default(0),
        status: keyResultStatusEnum("status").notNull().default("on_track"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("keyResult_objectiveId_idx").on(table.objectiveId),
        index("keyResult_status_idx").on(table.status),
    ]
);

// ── Relations ──────────────────────────────────────────────────────────────

export const objectiveRelations = relations(objective, ({ one, many }) => ({
    organization: one(organization, {
        fields: [objective.organizationId],
        references: [organization.organizationId],
    }),
    partner: one(partner, {
        fields: [objective.partnerId],
        references: [partner.partnerId],
    }),
    team: one(team, {
        fields: [objective.teamId],
        references: [team.teamId],
    }),
    creator: one(user, {
        fields: [objective.createdByUserId],
        references: [user.id],
        relationName: "objectiveCreator",
    }),
    keyResults: many(keyResult),
}));

export const keyResultRelations = relations(keyResult, ({ one }) => ({
    objective: one(objective, {
        fields: [keyResult.objectiveId],
        references: [objective.objectiveId],
    }),
}));
