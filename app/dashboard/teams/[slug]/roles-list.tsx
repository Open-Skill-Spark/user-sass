"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"
import { Plus } from "lucide-react"

interface Role {
  id: string
  name: string
}

export function RolesList({ 
  roles, 
  slug,
  isOwner
}: { 
  roles: Role[]
  slug: string
  isOwner: boolean
}) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")

  async function onCreateRole(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoleName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch(`/api/teams/${slug}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create role")
      }

      toast.success("Role created successfully")
      setNewRoleName("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium">Team Roles</h3>
      </div>
      
      <div className="p-4 border-b bg-muted/50">
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            owner (default)
          </div>
          <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            member (default)
          </div>
          {roles.map((role) => (
            <div key={role.id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {role.name}
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="p-4">
          <form onSubmit={onCreateRole} className="flex gap-2">
            <Input
              placeholder="New role name (e.g. Developer)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              disabled={isCreating}
              className="max-w-xs"
            />
            <Button type="submit" disabled={isCreating || !newRoleName.trim()}>
              {isCreating ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Role
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
