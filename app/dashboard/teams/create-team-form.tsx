"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"

const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens"),
})

type CreateTeamFormValues = z.infer<typeof createTeamSchema>

export function CreateTeamForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
  })

  const name = watch("name")

  useEffect(() => {
    if (name && !isSlugEdited) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setValue("slug", slug, { shouldValidate: true })
    }
  }, [name, isSlugEdited, setValue])

  async function onSubmit(data: CreateTeamFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create team")
      }

      toast.success("Team created successfully")
      router.push(`/dashboard/teams/${responseData.team.slug}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          placeholder="My Team"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Team Slug</Label>
        <Input
          id="slug"
          placeholder="my-team"
          disabled={isLoading}
          {...register("slug", {
            onChange: () => setIsSlugEdited(true),
          })}
        />
        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Create Team
      </Button>
    </form>
  )
}
