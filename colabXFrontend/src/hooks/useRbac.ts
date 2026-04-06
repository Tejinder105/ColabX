import { useAuthStore } from "@/stores/authStore";

export type OrgRole = "admin" | "manager" | "member" | "partner";

export interface RbacPermissions {
  role: OrgRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  isPartner: boolean;
  
  // Feature permissions
  canManagePartners: boolean;      // Add/edit/delete partners
  canManageTeams: boolean;         // Create/edit teams
  canInviteUsers: boolean;         // Invite users to org
  canAccessSettings: boolean;      // View org settings
  canManageRoles: boolean;         // Change user roles
  canViewAllPartners: boolean;     // View all partners in org
  canManageDeals: boolean;         // Create/edit deals
  canViewReports: boolean;         // View reports
  canManageDocuments: boolean;     // Upload/manage documents
}

// Hook to check user permissions based on their org role
export function useRbac(): RbacPermissions {
  const activeOrg = useAuthStore((state) => state.activeOrg);
  const role = (activeOrg?.role as OrgRole) || null;
  
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isMember = role === "member";
  const isPartner = role === "partner";
  
  return {
    role,
    isAdmin,
    isManager,
    isMember,
    isPartner,
    
    canManagePartners: isAdmin,
    canManageTeams: isAdmin,
    canInviteUsers: isAdmin,
    canAccessSettings: isAdmin || isManager,
    canManageRoles: isAdmin,
    
    canViewAllPartners: isAdmin || isManager,
    canManageDeals: isAdmin || isManager,
    canViewReports: isAdmin || isManager,
    
    canManageDocuments: true,
  };
}

export function hasAnyRole(role: OrgRole | null, allowedRoles: OrgRole[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function useHasPermission(permission: keyof Omit<RbacPermissions, "role" | "isAdmin" | "isManager" | "isMember" | "isPartner">): boolean {
  const permissions = useRbac();
  return permissions[permission];
}
