import { z } from "zod";

/**
 * Transform to normalize email (lowercase + trim)
 */
const normalizedEmail = z.string().email().transform(val => val.toLowerCase().trim());

// Partner types and industries - shared with frontend
export const PARTNER_TYPES = ["reseller", "agent", "technology", "distributor"] as const;
export const PARTNER_INDUSTRIES = [
    "Software",
    "Finance",
    "Healthcare",
    "Retail",
    "Manufacturing",
    "Defense",
    "Other",
] as const;

// Organization
export const createOrgSchema = z.object({
    name: z.string().min(2).max(100).trim(),
});

export const updateOrgSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
});

// Invitation
export const createInviteSchema = z.object({
    orgId: z.string().min(1),
    email: normalizedEmail,
    role: z.enum(["admin", "manager", "partner"]).default("partner"),
    // Partner-specific fields (required when role="partner")
    partnerType: z.enum(PARTNER_TYPES).optional(),
    partnerIndustry: z.enum(PARTNER_INDUSTRIES).optional(),
}).refine(
    (data) => {
        // If role is partner, partnerType is required
        if (data.role === "partner") {
            return data.partnerType !== undefined;
        }
        return true;
    },
    {
        message: "Partner type is required when inviting a partner",
        path: ["partnerType"],
    }
);

// Member management
export const changeMemberRoleSchema = z.object({
    role: z.enum(["admin", "manager", "partner"]),
});
