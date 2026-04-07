import * as React from "react"
import {
  BarChart2,
  Briefcase,
  Building2,
  FileText,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  Send,
  Settings2,
  Target,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/useAuth"
import { useRbac } from "@/hooks/useRbac"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "member"], 
    },
    {
      title: "Partners",
      url: "/partners",
      icon: Handshake,
      roles: ["admin", "manager"],
    },
    {
      title: "My Partnership",
      url: "/my-partnership",
      icon: Building2,
      roles: ["partner"], 
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      title: "OKRs & Performance",
      url: "/okrs",
      icon: Target,
      roles: ["admin", "manager", "member", "partner"],
    },
    {
      title: "Deals Collaboration",
      url: "/deals",
      icon: Briefcase,
      roles: ["admin", "manager", "member", "partner"],
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
      roles: ["admin", "manager", "member", "partner"],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart2,
      roles: ["admin"], 
    },
    {
      title: "Organization Settings",
      url: "/settings",
      icon: Settings2,
      roles: ["admin"],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: currentUser } = useCurrentUser()
  const { role } = useRbac()
  
  const navMainItems = data.navMain.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  })

  const user = {
    name: currentUser?.user?.name ?? "",
    email: currentUser?.user?.email ?? "",
    avatar: currentUser?.user?.image ?? "",
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
