import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { contact } from "./contacts.schema.js";
import { partner } from "../partners/partners.schema.js";

export async function createContact(
    partnerId: string,
    userId: string,
    data: {
        name: string;
        email: string;
        phone?: string;
        role?: string;
        isPrimary?: boolean;
    }
) {
    const [created] = await db
        .insert(contact)
        .values({
            contactId: crypto.randomUUID(),
            partnerId,
            name: data.name,
            email: data.email,
            phone: data.phone ?? null,
            role: data.role ?? null,
            isPrimary: data.isPrimary ?? false,
            createdByUserId: userId,
        })
        .returning();

    return created;
}

export async function getPartnerContacts(partnerId: string) {
    return db
        .select()
        .from(contact)
        .where(eq(contact.partnerId, partnerId));
}

export async function getContactById(contactId: string, organizationId: string) {
    const [result] = await db
        .select({
            contactId: contact.contactId,
            partnerId: contact.partnerId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            isPrimary: contact.isPrimary,
            createdByUserId: contact.createdByUserId,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
        })
        .from(contact)
        .innerJoin(partner, eq(contact.partnerId, partner.partnerId))
        .where(and(eq(contact.contactId, contactId), eq(partner.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function updateContact(
    contactId: string,
    data: Record<string, string | boolean | null | undefined>
) {
    const [updated] = await db
        .update(contact)
        .set(data)
        .where(eq(contact.contactId, contactId))
        .returning();

    return updated;
}

export async function deleteContact(contactId: string) {
    const [deleted] = await db
        .delete(contact)
        .where(eq(contact.contactId, contactId))
        .returning();

    return deleted;
}
