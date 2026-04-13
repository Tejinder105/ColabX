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

// Contact table 
export const contact = pgTable(
    "contact",
    {
        contactId: text("contactId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.partnerId, { onDelete: "cascade" }),
        name: text("name").notNull(),
        email: text("email").notNull(),
        phone: text("phone"),
        role: text("role"),
        isPrimary: boolean("isPrimary").notNull().default(false),
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
        index("contact_organizationId_idx").on(table.organizationId),
        index("contact_partnerId_idx").on(table.partnerId),
    ]
);

// Relations
export const contactRelations = relations(contact, ({ one }) => ({
    organization: one(organization, {
        fields: [contact.organizationId],
        references: [organization.organizationId],
    }),
    partner: one(partner, {
        fields: [contact.partnerId],
        references: [partner.partnerId],
    }),
    creator: one(user, {
        fields: [contact.createdByUserId],
        references: [user.id],
    }),
}));
