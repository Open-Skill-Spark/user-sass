import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { InviteMemberForm } from "./invite-member-form"
import { TeamMembersList } from "./team-members-list"
import { RolesList } from "./roles-list"

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getSession()
  const { slug } = await params

  if (!session) {
    redirect("/login")
  }

  const teams = await sql`
    SELECT * FROM teams WHERE slug = ${slug}
  `

  if (teams.length === 0) {
    notFound()
  }
  const team = teams[0]

  // Check if user is a member
  const membership = await sql`
    SELECT * FROM team_members 
    WHERE team_id = ${team.id} AND user_id = ${session.user.id}
  `

  if (membership.length === 0) {
    redirect("/dashboard/teams")
  }
  const userRole = membership[0].role

  const members = await sql`
    SELECT tm.id, u.name, u.email, tm.role, tm.user_id
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ${team.id}
    ORDER BY tm.created_at ASC
  `

  const roles = await sql`
    SELECT * FROM team_roles 
    WHERE team_id = ${team.id} 
    ORDER BY created_at DESC
  `

  const isOwner = userRole === "owner"

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">Manage your team members and settings.</p>
      </div>

      {(userRole === "owner" || userRole === "admin") && (
        <InviteMemberForm 
          slug={slug} 
          availableRoles={roles.map(r => ({ id: r.id, name: r.name }))}
        />
      )}

      <TeamMembersList 
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          user_id: m.user_id,
        }))} 
        slug={slug}
        currentUserId={session.user.id}
      />

      <RolesList 
        roles={roles.map((r) => ({
          id: r.id,
          name: r.name,
        }))}
        slug={slug}
        isOwner={isOwner}
      />
    </div>
  )
}
