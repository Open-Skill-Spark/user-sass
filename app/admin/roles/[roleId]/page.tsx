"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  permissionDetails: Permission[]
}

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.roleId as string

  const [role, setRole] = useState<Role | null>(null)
  const [allPermissions, setAllPermissions] = useState<{ [category: string]: Permission[] }>({})
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchRoleAndPermissions()
  }, [roleId])

  const fetchRoleAndPermissions = async () => {
    try {
      // Fetch role details
      const roleResponse = await fetch(`/api/admin/roles/${roleId}`)
      if (!roleResponse.ok) throw new Error("Failed to fetch role")
      const roleData = await roleResponse.json()
      
      setRole(roleData.role)
      setFormData({
        name: roleData.role.name,
        description: roleData.role.description || "",
      })
      setSelectedPermissions(new Set(roleData.role.permissions))

      // Fetch all permissions
      const permsResponse = await fetch("/api/admin/permissions")
      if (!permsResponse.ok) throw new Error("Failed to fetch permissions")
      const permsData = await permsResponse.json()
      setAllPermissions(permsData.grouped)
    } catch (error) {
      toast.error("Failed to load role details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionName: string) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName)
    } else {
      newSelected.add(permissionName)
    }
    setSelectedPermissions(newSelected)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: Array.from(selectedPermissions),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update role")
      }

      toast.success("Role updated successfully")
      router.push("/admin/roles")
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Icons.alert className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Role not found</h3>
        <Button onClick={() => router.push("/admin/roles")} className="mt-4">
          Back to Roles
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          <p className="text-muted-foreground">
            Configure role details and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/roles")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || role.is_system}>
            {saving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      {role.is_system && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icons.alert className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  System Role
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This is a system role. You can view permissions but cannot modify the role name or description.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Basic details about this role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={role.is_system}
              placeholder="e.g., Marketing Manager"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={role.is_system}
              placeholder="Describe what this role can do..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Select which permissions this role should have ({selectedPermissions.size} selected)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(allPermissions).map(([category, permissions]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  {category}
                </h3>
                <div className="grid gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.has(permission.name)}
                        onCheckedChange={() => handlePermissionToggle(permission.name)}
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={permission.id}
                          className="font-mono text-sm cursor-pointer"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/roles")}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back to Roles
        </Button>
        <Button onClick={handleSave} disabled={saving || role.is_system}>
          {saving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
