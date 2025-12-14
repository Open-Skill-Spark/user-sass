"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Tenant {
  id: string
  name: string
  slug: string
  owner_email: string
  created_at: string
  is_suspended: boolean
}

export function TenantsList({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function toggleSuspension(tenantId: string, isSuspended: boolean) {
    setIsLoading(tenantId)
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !isSuspended }),
      })

      if (!response.ok) {
        throw new Error("Failed to update tenant status")
      }

      toast.success(isSuspended ? "Tenant unsuspended" : "Tenant suspended")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle font-medium">{tenant.name}</td>
                <td className="p-4 align-middle">{tenant.slug}</td>
                <td className="p-4 align-middle">{tenant.owner_email}</td>
                <td className="p-4 align-middle">{format(new Date(tenant.created_at), "MMM d, yyyy")}</td>
                <td className="p-4 align-middle">
                  <Badge variant={tenant.is_suspended ? "destructive" : "default"}>
                    {tenant.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading === tenant.id}
                    onClick={() => toggleSuspension(tenant.id, tenant.is_suspended)}
                  >
                    {isLoading === tenant.id ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      tenant.is_suspended ? "Unsuspend" : "Suspend"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
