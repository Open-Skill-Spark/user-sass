import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { InviteMemberForm } from "./invite-member-form"
import { TeamMembersList } from "./team-members-list"
import { RolesList } from "./roles-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/ui/icons"
import { Plus } from "lucide-react"

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

  if (team.is_suspended) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Icons.shield className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">Tenant Suspended</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This tenant has been suspended by the platform administrator. 
          Please contact support for more information.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/teams">Back to Teams</Link>
        </Button>
      </div>
    )
  }

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

  const subTeams = await sql`
    SELECT * FROM teams 
    WHERE parent_team_id = ${team.id}
    ORDER BY name ASC
  `

  const isOwner = userRole === "owner"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">Manage your team members and settings.</p>
        </div>
        {(userRole === "owner" || userRole === "admin") && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/teams/${slug}/settings`}>
              <Icons.settings className="mr-2 h-4 w-4" />
              Team Settings
            </Link>
          </Button>
        )}
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

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Departments (Sub-teams)</h3>
          {(userRole === "owner" || userRole === "admin") && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/teams/new?parent=${team.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Link>
            </Button>
          )}
        </div>
        
        {subTeams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No departments yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subTeams.map((subTeam) => (
              <Link
                key={subTeam.id}
                href={`/dashboard/teams/${subTeam.slug}`}
                className="block rounded-lg border p-4 hover:bg-muted/50"
              >
                <h4 className="font-semibold">{subTeam.name}</h4>
                <p className="text-sm text-muted-foreground">{subTeam.slug}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
