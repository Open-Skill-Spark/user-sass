"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Icons } from "@/components/ui/icons"
import { PlusCircle } from "lucide-react"

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export function InviteMemberForm({ 
  slug,
  availableRoles
}: { 
  slug: string
  availableRoles: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingRole, setIsAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "member",
    },
  })

  const selectedRole = watch("role")

  async function onSubmit(data: InviteFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${slug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to invite member")
      }

      toast.success("Member invited successfully")
      reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (value: string) => {
    if (value === "add_new") {
      setIsAddingRole(true)
    } else {
      setValue("role", value)
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return

    // Client-side validation for existing roles
    const roleExists = availableRoles.some(
      r => r.name.toLowerCase() === newRoleName.trim().toLowerCase()
    ) || ["owner", "admin", "member"].includes(newRoleName.trim().toLowerCase())

    if (roleExists) {
      toast.error("Role already exists")
      return
    }

    setIsCreatingRole(true)
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
      setIsAddingRole(false)
      setValue("role", data.role.name) // Select the newly created role
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsCreatingRole(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-medium">Invite Member</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="w-[200px] space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={selectedRole}
            onValueChange={handleRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
              <SelectItem value="add_new" className="text-primary font-medium">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add new role
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Invite
        </Button>
      </form>

      <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">Role Name</Label>
              <Input
                id="newRole"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Developer"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingRole(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingRole || !newRoleName.trim()}>
                {isCreatingRole && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
