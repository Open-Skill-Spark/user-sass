import type React from "react"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
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

  const teams = await sql`
    SELECT t.id, t.name, t.slug
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${session.user.id}
    ORDER BY t.name ASC
  `

  return (
    <DashboardLayout
      user={{
        name: session.user.email.split("@")[0],
        email: session.user.email,
        role: session.user.role,
      }}
      teams={teams.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug
      }))}
    >
      {children}
    </DashboardLayout>
  )
}
