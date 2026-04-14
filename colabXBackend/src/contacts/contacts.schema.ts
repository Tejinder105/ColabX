import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    boolean,
} from "drizzle-orm/pg-core";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";

// Contact table 
export const contact = pgTable(
    "contact",
    {
        contactId: text("contactId").primaryKey(),
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
        index("contact_partnerId_idx").on(table.partnerId),
    ]
);

// Relations
export const contactRelations = relations(contact, ({ one }) => ({
    partner: one(partner, {
        fields: [contact.partnerId],
        references: [partner.partnerId],
    }),
    creator: one(user, {
        fields: [contact.createdByUserId],
        references: [user.id],
    }),
}));
