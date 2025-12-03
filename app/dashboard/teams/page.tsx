import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TeamsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const teams = await sql`
    SELECT t.*, tm.role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${session.user.id}
  `

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>
      
      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-medium">No teams yet</h2>
          <p className="text-muted-foreground">Create a team to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/dashboard/teams/${team.slug}`}
              className="block rounded-lg border p-4 hover:bg-muted/50"
            >
              <h2 className="font-semibold">{team.name}</h2>
              <p className="text-sm text-muted-foreground">{team.role}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
