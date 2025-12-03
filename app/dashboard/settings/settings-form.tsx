"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"

interface SettingsFormProps {
  user: {
    id: string
    name: string | null
    email: string
    isTwoFactorEnabled: boolean
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(user.isTwoFactorEnabled)

  const [name, setName] = useState(user.name || "")

  async function onUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function onToggleTwoFactor(checked: boolean) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTwoFactorEnabled: checked }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      setIsTwoFactorEnabled(checked)
      toast.success("Settings updated")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
      // Revert state on error
      setIsTwoFactorEnabled(!checked)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-medium">Profile</h3>
        <form onSubmit={onUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                 <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Two-factor Authentication</Label>
          <p className="text-sm text-muted-foreground">
            Secure your account with 2FA.
          </p>
        </div>
        <Switch
          checked={isTwoFactorEnabled}
          onCheckedChange={onToggleTwoFactor}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
