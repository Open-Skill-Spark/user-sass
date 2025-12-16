"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface GroupedPermissions {
  [category: string]: Permission[]
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [grouped, setGrouped] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions")
      if (!response.ok) throw new Error("Failed to fetch permissions")
      const data = await response.json()
      setPermissions(data.permissions)
      setGrouped(data.grouped)
    } catch (error) {
      toast.error("Failed to load permissions")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">
          All available permissions in the system
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Permission Overview</CardTitle>
            <CardDescription>
              {permissions.length} total permissions across {Object.keys(grouped).length} categories
            </CardDescription>
          </CardHeader>
        </Card>

        {Object.entries(grouped).map(([category, perms]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-xl capitalize flex items-center gap-2">
                <Icons.lock className="h-5 w-5" />
                {category}
              </CardTitle>
              <CardDescription>
                {perms.length} permission{perms.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {perms.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {permission.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
