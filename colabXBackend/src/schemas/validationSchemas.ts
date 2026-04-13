import { z } from "zod";
import { INVITABLE_ORG_ROLES, ORG_ROLES } from "../org/org.constants.js";

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
    logo: z.string().url().trim().optional(),
    industry: z.string().min(2).max(100).trim().optional(),
    timezone: z.string().min(2).max(100).trim().optional(),
});

export const updateOrgSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    logo: z.string().url().trim().nullish(),
    industry: z.string().min(2).max(100).trim().nullish(),
    timezone: z.string().min(2).max(100).trim().nullish(),
});

// Invitation
export const createInviteSchema = z.object({
    organizationId: z.string().min(1),
    email: normalizedEmail,
    role: z.enum(INVITABLE_ORG_ROLES).default("partner"),
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
    role: z.enum(ORG_ROLES),
});
