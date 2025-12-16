import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { sql } from "@/lib/db"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch user's teams
  const teams = await sql`
    SELECT t.id, t.name, t.slug
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${user.id}
    ORDER BY t.created_at DESC
  `

  return (
    <DashboardLayout
      user={{
        name: user.name || "",
        email: user.email || "",
        image: user.image || undefined,
        role: user.role || "user",
      }}
      teams={teams.map((team) => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
      }))}
    >
      {children}
    </DashboardLayout>
  )
}
