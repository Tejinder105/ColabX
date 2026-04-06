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
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        partnerId: text("partnerId").references(() => partner.id, { onDelete: "cascade" }),
        teamId: text("teamId").references(() => team.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        startDate: date("startDate").notNull(),
        endDate: date("endDate").notNull(),
        createdBy: text("createdBy").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("objective_orgId_idx").on(table.orgId),
        index("objective_partnerId_idx").on(table.partnerId),
        index("objective_teamId_idx").on(table.teamId),
    ]
);

// ── Key Result table ───────────────────────────────────────────────────────

export const keyResult = pgTable(
    "keyResult",
    {
        id: text("id").primaryKey(),
        objectiveId: text("objectiveId")
            .notNull()
            .references(() => objective.id, { onDelete: "cascade" }),
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
        fields: [objective.orgId],
        references: [organization.id],
    }),
    partner: one(partner, {
        fields: [objective.partnerId],
        references: [partner.id],
    }),
    team: one(team, {
        fields: [objective.teamId],
        references: [team.id],
    }),
    creator: one(user, {
        fields: [objective.createdBy],
        references: [user.id],
        relationName: "objectiveCreator",
    }),
    keyResults: many(keyResult),
}));

export const keyResultRelations = relations(keyResult, ({ one }) => ({
    objective: one(objective, {
        fields: [keyResult.objectiveId],
        references: [objective.id],
    }),
}));
