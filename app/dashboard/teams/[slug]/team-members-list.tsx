"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Trash2 } from "lucide-react"

interface Member {
  id: string
  name: string | null
  email: string
  role: string
  user_id: string
}

export function TeamMembersList({ 
  members, 
  slug,
  currentUserId 
}: { 
  members: Member[]
  slug: string
  currentUserId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function onRemoveMember(userId: string) {
    setIsLoading(userId)
    try {
      const response = await fetch(`/api/teams/${slug}/members/${userId}`, {
        method: "DELETE",
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to remove member")
      }

      toast.success("Member removed successfully")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Team Members</h3>
      </div>
      <div className="divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{member.name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
              {member.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading === member.user_id}
                  onClick={() => onRemoveMember(member.user_id)}
                >
                  {isLoading === member.user_id ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
