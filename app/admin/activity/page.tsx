import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function ActivityLogsPage() {
  const session = await getSession()

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const logs = await sql`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 50
  `

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b bg-muted/50">
          <div className="grid grid-cols-5 gap-4 font-medium">
            <div>Action</div>
            <div>User</div>
            <div>IP Address</div>
            <div>Details</div>
            <div>Time</div>
          </div>
        </div>
        <div className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-5 gap-4 p-4 items-center text-sm">
              <div className="font-medium">{log.action}</div>
              <div>
                <div className="font-medium">{log.user_name || "Unknown"}</div>
                <div className="text-xs text-muted-foreground">{log.user_email}</div>
              </div>
              <div className="font-mono text-xs">{log.ip_address}</div>
              <div className="truncate text-xs text-muted-foreground">
                {JSON.stringify(log.details)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
