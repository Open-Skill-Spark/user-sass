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
import { Icons } from "@/components/ui/icons"

const teamSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens"),
  domain: z.string().optional().refine(val => !val || /^[a-z0-9.-]+\.[a-z]{2,}$/.test(val), "Invalid domain format"),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
})

type TeamSettingsFormValues = z.infer<typeof teamSettingsSchema>

export function TeamSettingsForm({ 
  team, 
  slug: currentSlug 
}: { 
  team: { 
    name: string
    slug: string
    domain?: string | null
    theme_color?: string | null
    logo_url?: string | null
  }
  slug: string 
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamSettingsFormValues>({
    resolver: zodResolver(teamSettingsSchema),
    defaultValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain || "",
      theme_color: team.theme_color || "#000000",
      logo_url: team.logo_url || "",
    },
  })

  async function onSubmit(data: TeamSettingsFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${currentSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update team settings")
      }

      toast.success("Team settings updated successfully")
      if (responseData.team.slug !== currentSlug) {
        router.push(`/dashboard/teams/${responseData.team.slug}/settings`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Team Slug (URL)</Label>
        <Input
          id="slug"
          disabled={isLoading}
          {...register("slug")}
        />
        <p className="text-xs text-muted-foreground">Changing this will update your team's URL.</p>
        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          placeholder="https://example.com/logo.png"
          disabled={isLoading}
          {...register("logo_url")}
        />
        <p className="text-xs text-muted-foreground">URL to your team's logo image.</p>
        {errors.logo_url && <p className="text-sm text-red-500">{errors.logo_url.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Custom Domain</Label>
        <Input
          id="domain"
          placeholder="team.example.com"
          disabled={isLoading}
          {...register("domain")}
        />
        <p className="text-xs text-muted-foreground">Map a custom domain to your team (requires DNS configuration).</p>
        {errors.domain && <p className="text-sm text-red-500">{errors.domain.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme_color">Theme Color</Label>
        <div className="flex gap-2">
          <Input
            id="theme_color"
            type="color"
            className="w-12 p-1 h-10"
            disabled={isLoading}
            {...register("theme_color")}
          />
          <Input
            type="text"
            placeholder="#000000"
            className="flex-1"
            disabled={isLoading}
            {...register("theme_color")}
          />
        </div>
        <p className="text-xs text-muted-foreground">Customize your team's primary color.</p>
        {errors.theme_color && <p className="text-sm text-red-500">{errors.theme_color.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-8">
        <h3 className="text-red-800 font-medium mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          Deleting a team is permanent and cannot be undone. All data associated with this team will be lost.
        </p>
        <Button 
          type="button" 
          variant="destructive" 
          disabled={isLoading}
          onClick={async () => {
            if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
              setIsLoading(true)
              try {
                const response = await fetch(`/api/teams/${currentSlug}`, {
                  method: "DELETE",
                })

                if (!response.ok) {
                  throw new Error("Failed to delete team")
                }

                toast.success("Team deleted successfully")
                router.push("/dashboard/teams")
                router.refresh()
              } catch (error) {
                toast.error("Something went wrong")
              } finally {
                setIsLoading(false)
              }
            }
          }}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Delete Team
        </Button>
      </div>
    </form>
  )
}
