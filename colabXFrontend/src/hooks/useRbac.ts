/**
 * RBAC (Role-Based Access Control) Hook
 * Centralizes permission checks for UI-level access control
 */

import { useAuthStore } from "@/stores/authStore";

export type OrgRole = "admin" | "manager" | "partner";

export interface RbacPermissions {
  // Role checks
  role: OrgRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isPartner: boolean;
  
  // Feature permissions
  canManagePartners: boolean;      // Add/edit/delete partners
  canManageTeams: boolean;         // Create/edit teams
  canInviteUsers: boolean;         // Invite users to org
  canAccessSettings: boolean;      // View org settings
  canManageRoles: boolean;         // Change user roles
  canViewAllPartners: boolean;     // View all partners (not just self)
  canManageDeals: boolean;         // Create/edit deals
  canViewReports: boolean;         // View reports
  canManageDocuments: boolean;     // Upload/manage documents
}

/**
 * Hook to check user permissions based on their org role
 * 
 * Permission Matrix:
 * - Admin: Full control (all permissions)
 * - Manager: Operations (view partners, manage deals, limited settings)
 * - Partner: Execution (view assigned deals, upload docs, update progress)
 */
export function useRbac(): RbacPermissions {
  const activeOrg = useAuthStore((state) => state.activeOrg);
  const role = (activeOrg?.role as OrgRole) || null;
  
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isPartner = role === "partner";
  
  return {
    role,
    isAdmin,
    isManager,
    isPartner,
    
    // Structure Control - Admin only
    canManagePartners: isAdmin,
    canManageTeams: isAdmin,
    canInviteUsers: isAdmin,
    canAccessSettings: isAdmin || isManager,
    canManageRoles: isAdmin,
    
    // Operations - Admin & Manager
    canViewAllPartners: isAdmin || isManager,
    canManageDeals: isAdmin || isManager,
    canViewReports: isAdmin || isManager,
    
    // Execution - All roles (with scoped access)
    canManageDocuments: true,
  };
}

/**
 * Helper to check if user has at least one of the specified roles
 */
export function hasAnyRole(role: OrgRole | null, allowedRoles: OrgRole[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Helper to check if user has a specific permission
 */
export function useHasPermission(permission: keyof Omit<RbacPermissions, "role" | "isAdmin" | "isManager" | "isPartner">): boolean {
  const permissions = useRbac();
  return permissions[permission];
}
