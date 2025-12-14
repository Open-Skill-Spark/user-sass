
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { AcceptInviteForm } from "./accept-invite-form"

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <div>Invalid invitation link</div>
  }

  // Find invitation
  const result = await sql`
    SELECT tm.*, u.email, u.password_hash, t.name as team_name
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.invitation_token = ${token}
    AND tm.status = 'invited'
  `

  if (result.length === 0) {
    return <div>Invitation not found or already accepted</div>
  }

  const invitation = result[0]
  const isNewUser = invitation.password_hash === 'placeholder'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Join {invitation.team_name}</h1>
        <p className="mb-6 text-muted-foreground">
          You have been invited to join {invitation.team_name} on our platform.
        </p>
        
        <AcceptInviteForm 
          token={token} 
          email={invitation.email} 
          isNewUser={isNewUser} 
        />
      </div>
    </div>
  )
}
