import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { TenantsList } from "@/app/admin/tenants/tenants-list"

export default async function TenantsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const tenants = await sql`
    SELECT t.*, u.email as owner_email
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    JOIN users u ON tm.user_id = u.id
    WHERE tm.role = 'owner'
    ORDER BY t.created_at DESC
  `

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tenants Management</h1>
      <p className="text-muted-foreground">Manage all tenants (teams) in the system.</p>
      <TenantsList 
        tenants={tenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          owner_email: t.owner_email,
          created_at: t.created_at,
          is_suspended: t.is_suspended,
        }))} 
      />
    </div>
  )
}
