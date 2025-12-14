import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { TeamSettingsForm } from "./team-settings-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function TeamSettingsPage({
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

  // Check if user is owner or admin
  const membership = await sql`
    SELECT role FROM team_members 
    WHERE team_id = ${team.id} AND user_id = ${session.user.id}
  `

  if (membership.length === 0 || (membership[0].role !== "owner" && membership[0].role !== "admin")) {
    redirect(`/dashboard/teams/${slug}`)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 pl-0">
          <Link href={`/dashboard/teams/${slug}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground">Manage your team's profile and branding.</p>
      </div>

      <div className="rounded-lg border p-6">
        <TeamSettingsForm 
          team={{
            name: team.name,
            slug: team.slug,
            domain: team.domain,
            theme_color: team.theme_color,
            logo_url: team.logo_url,
          }}
          slug={slug}
        />
      </div>
    </div>
  )
}
