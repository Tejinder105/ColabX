import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { contact } from "./contacts.schema.js";

export async function createContact(
    orgId: string,
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
            id: crypto.randomUUID(),
            orgId,
            partnerId,
            name: data.name,
            email: data.email,
            phone: data.phone ?? null,
            role: data.role ?? null,
            isPrimary: data.isPrimary ?? false,
            createdBy: userId,
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

export async function getContactById(contactId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(contact)
        .where(and(eq(contact.id, contactId), eq(contact.orgId, orgId)))
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
        .where(eq(contact.id, contactId))
        .returning();

    return updated;
}

export async function deleteContact(contactId: string) {
    const [deleted] = await db
        .delete(contact)
        .where(eq(contact.id, contactId))
        .returning();

    return deleted;
}
