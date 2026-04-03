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
import { useAuthStore } from "@/stores/authStore"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: Handshake,
    },
    {
      title: "My Partnership",
      url: "/my-partnership",
      icon: Building2,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Users,
    },
    {
      title: "OKRs & Performance",
      url: "/okrs",
      icon: Target,
    },
    {
      title: "Deals Collaboration",
      url: "/deals",
      icon: Briefcase,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart2,
    },
    {
      title: "Organization Settings",
      url: "/settings",
      icon: Settings2,
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
  const activeOrg = useAuthStore((state) => state.activeOrg)
  const isPartnerRole = activeOrg?.role === "partner"

  const navMainItems = data.navMain.filter((item) => {
    if (isPartnerRole) {
      return item.title !== "Partners"
    }

    return item.title !== "My Partnership"
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
