import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { SettingsForm } from "./settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const users = await sql`
    SELECT * FROM users WHERE id = ${session.user.id}
  `
  const user = users[0]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      <SettingsForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          isTwoFactorEnabled: user.is_two_factor_enabled,
        }}
      />
    </div>
  )
}
