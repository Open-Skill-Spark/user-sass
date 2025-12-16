"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Icons } from "@/components/ui/icons"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, Plus } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    image?: string
    role: string
  }
  teams?: {
    id: string
    name: string
    slug: string
  }[]
}

export function DashboardLayout({ children, user, teams = [] }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // improved team detection logic
  const currentTeamSlug = pathname.startsWith("/dashboard/teams/") 
    ? pathname.split("/")[3] 
    : null
    
  const currentTeam = teams.find(t => t.slug === currentTeamSlug)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  // Main navigation items (visible to all users)
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Icons.dashboard,
    },
    {
      title: "Teams",
      href: "/dashboard/teams",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Icons.settings,
    },
  ]

  // Admin section items
  const adminNavItems = user?.role === "admin" ? [
    {
      section: "ADMIN",
      items: [
        {
          title: "Users",
          href: "/admin/users",
          icon: Icons.user,
        },
        {
          title: "Tenants",
          href: "/admin/tenants",
          icon: Icons.building,
        },
        {
          title: "Roles & Permissions",
          href: "/admin/roles",
          icon: Icons.shield,
        },
        {
          title: "Social Connections",
          href: "/admin/auth/social",
          icon: Icons.link,
        },
      ]
    },
    {
      section: "SECURITY",
      items: [
        {
          title: "Security Settings",
          href: "/admin/security",
          icon: Icons.shieldAlert,
        },
        {
          title: "Active Sessions",
          href: "/admin/sessions",
          icon: Icons.monitorSmartphone,
        },
        {
          title: "Audit Logs",
          href: "/admin/activity",
          icon: Icons.scrollText,
        },
      ]
    },
    {
      section: "CUSTOMIZATION",
      items: [
        {
          title: "Branding",
          href: "/admin/branding",
          icon: Icons.palette,
        },
        {
          title: "Domains",
          href: "/admin/domains",
          icon: Icons.globe,
        },
      ]
    },
    {
      section: "ANALYTICS",
      items: [
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: Icons.trendingUp,
        },
      ]
    },
    {
      section: "SYSTEM",
      items: [
        {
          title: "API Keys",
          href: "/admin/api-keys",
          icon: Icons.key,
        },
        {
          title: "Webhooks",
          href: "/admin/webhooks",
          icon: Icons.webhook,
        },
        {
          title: "Email Settings",
          href: "/admin/email",
          icon: Icons.mail,
        },
        {
          title: "Import/Export",
          href: "/admin/data/import-export",
          icon: Icons.database,
        },
        {
          title: "Multi-tenant Model",
          href: "/dashboard/multi-tenant",
          icon: Icons.server,
        },
      ]
    },
  ] : []

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 font-semibold hover:bg-muted/50 p-2 rounded-md w-full transition-colors outline-none">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
                  <Icons.shield className="h-4 w-4" />
                </div>
                <span className="truncate flex-1 text-left">
                  {currentTeam ? currentTeam.name : "Select Team"}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
              <DropdownMenuLabel>Teams</DropdownMenuLabel>
              {teams.map((team) => (
                <DropdownMenuItem key={team.id} asChild>
                  <Link href={`/dashboard/teams/${team.slug}`} className="cursor-pointer">
                    {team.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/teams/new" className="cursor-pointer flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          {/* Main Navigation */}
          <SidebarMenu className="p-2">
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Admin Sections */}
          {adminNavItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {section.section}
                </p>
              </div>
              <SidebarMenu className="px-2">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user?.name || "User"}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
            </div>
            <button onClick={handleLogout} className="ml-auto text-muted-foreground hover:text-foreground">
              <Icons.logout className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          <SidebarTrigger />
          <div className="flex-1" />
          <button className="text-muted-foreground hover:text-foreground">
            <Icons.bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
