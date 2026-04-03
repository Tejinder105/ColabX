import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    uniqueIndex,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";

export const teamRoleEnum = pgEnum("teamRole", ["lead", "member"]);

// Team table — one team belongs to one organization
export const team = pgTable(
    "team",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
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
        index("team_orgId_idx").on(table.orgId),
        index("team_createdBy_idx").on(table.createdBy),
    ]
);

// TeamMember table — links users to teams with a team-level role
export const teamMember = pgTable(
    "teamMember",
    {
        id: text("id").primaryKey(),
        teamId: text("teamId")
            .notNull()
            .references(() => team.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        role: teamRoleEnum("role").notNull().default("member"),
        joinedAt: timestamp("joinedAt").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("teamMember_teamId_userId_unique").on(
            table.teamId,
            table.userId
        ),
        index("teamMember_teamId_idx").on(table.teamId),
        index("teamMember_userId_idx").on(table.userId),
    ]
);

// Relations
export const teamRelations = relations(team, ({ one, many }) => ({
    organization: one(organization, {
        fields: [team.orgId],
        references: [organization.id],
    }),
    creator: one(user, {
        fields: [team.createdBy],
        references: [user.id],
    }),
    members: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
    team: one(team, {
        fields: [teamMember.teamId],
        references: [team.id],
    }),
    user: one(user, {
        fields: [teamMember.userId],
        references: [user.id],
    }),
}));
