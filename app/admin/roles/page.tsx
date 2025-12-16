"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles")
      if (!response.ok) throw new Error("Failed to fetch roles")
      const data = await response.json()
      setRoles(data.roles)
    } catch (error) {
      toast.error("Failed to load roles")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/roles?roleId=${roleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete role")
      }

      toast.success("Role deleted successfully")
      fetchRoles()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage roles and assign permissions to control access
          </p>
        </div>
        <Link href="/admin/roles/new">
          <Button>
            <Icons.shield className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>
            {roles.length} role{roles.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || "No description"}
                  </TableCell>
                  <TableCell>
                    {role.is_system ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {role.permissions?.length || 0} permissions
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/roles/${role.id}`}>
                        <Button variant="ghost" size="sm">
                          <Icons.settings className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(role.id, role.name)}
                        >
                          <Icons.close className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {roles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No roles found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first custom role
              </p>
              <Link href="/admin/roles/new">
                <Button>Create Role</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/permissions">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.lock className="h-4 w-4" />
                  View All Permissions
                </CardTitle>
                <CardDescription>
                  See all available permissions in the system
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.user className="h-4 w-4" />
                  Manage Users
                </CardTitle>
                <CardDescription>
                  Assign roles and permissions to users
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
