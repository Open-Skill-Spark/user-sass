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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    image?: string
    role: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Icons.dashboard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Icons.settings,
    },
  ]

  if (user?.role === "admin") {
    navItems.push({
      title: "Users",
      href: "/dashboard/users",
      icon: Icons.user,
    })
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Icons.shield className="h-6 w-6" />
            <span>SaaS App</span>
          </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarMenu className="p-2">
            {navItems.map((item) => (
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
