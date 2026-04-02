import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    boolean,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";

// Contact table — contacts belong to a partner
export const contact = pgTable(
    "contact",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        email: text("email").notNull(),
        phone: text("phone"),
        role: text("role"),
        isPrimary: boolean("isPrimary").notNull().default(false),
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
        index("contact_orgId_idx").on(table.orgId),
        index("contact_partnerId_idx").on(table.partnerId),
    ]
);

// Relations
export const contactRelations = relations(contact, ({ one }) => ({
    organization: one(organization, {
        fields: [contact.orgId],
        references: [organization.id],
    }),
    partner: one(partner, {
        fields: [contact.partnerId],
        references: [partner.id],
    }),
    creator: one(user, {
        fields: [contact.createdBy],
        references: [user.id],
    }),
}));
