import type React from "react"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { redirect } from "next/navigation"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.email.split("@")[0],
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
