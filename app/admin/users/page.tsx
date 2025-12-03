import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminUsersPage() {
  const session = await getSession()

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const users = await sql`
    SELECT id, name, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b bg-muted/50">
          <div className="grid grid-cols-4 gap-4 font-medium">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
          </div>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-4 gap-4 p-4 items-center">
              <div>{user.name || "Unknown"}</div>
              <div>{user.email}</div>
              <div className="capitalize">{user.role}</div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
