import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  Search,
  Settings2,
  SidebarIcon,
  Slash,
  Users,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/authStore"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const activeOrg = useAuthStore((state) => state.activeOrg)

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getPageTitle = (segment: string) => {
    const titles: Record<string, string> = {
      "dashboard": "Dashboard",
      "partners": "Partners",
      "teams": "Teams",
      "okrs": "OKRs & Performance",
      "deals": "Deals Collaboration",
      "documents": "Documents",
      "reports": "Reports",
      "settings": "Organization Settings",
      "support": "Support",
      "feedback": "Feedback",
    };
    return titles[segment] || (segment.length > 20 ? "Details" : segment.charAt(0).toUpperCase() + segment.slice(1));
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:flex">
              <BreadcrumbLink asChild className="flex items-center gap-2">
                <Link to="/">
                  <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <SidebarIcon className="size-4" />
                  </div>
                  {activeOrg?.name ?? "Organization"}
                  <span className="rounded-full border px-1.5 py-0.5 text-[10px] uppercase font-medium text-muted-foreground bg-muted">
                    Free
                  </span>
                  <div className="flex items-center text-muted-foreground">
                    <ChevronDown className="size-3" />
                  </div>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {pathSegments.length > 0 ? (
              pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;
                const title = getPageTitle(segment);

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator>
                      <Slash className="-rotate-12" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem className={isLast ? "" : "hidden md:flex"}>
                      {isLast ? (
                        <span className="font-medium text-foreground">{title}</span>
                      ) : (
                        <BreadcrumbLink asChild className="text-muted-foreground">
                          <Link to={`/${pathSegments.slice(0, index + 1).join('/')}`}>
                            {title}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })
            ) : (
              <React.Fragment>
                <BreadcrumbSeparator>
                  <Slash className="-rotate-12" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <span className="font-medium text-foreground">Dashboard</span>
                </BreadcrumbItem>
              </React.Fragment>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full sm:ml-auto sm:w-auto">
          <button
            onClick={() => setOpen(true)}
            className="relative inline-flex h-9 w-full items-center justify-start whitespace-nowrap rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-64"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Deals</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings2 className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Teams">
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Design</span>
                </CommandItem>
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Marketing</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      </div>
    </header>
  )
}
