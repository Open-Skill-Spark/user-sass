"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { Icons } from "@/components/ui/icons"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  code: z.optional(z.string()),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  // Use useSearchParams to get callbackUrl, but need to wrap in Suspense or handle client-side
  // For simplicity, we can just use window.location or similar in useEffect, but Next.js encourages useSearchParams.
  // Since we are in "use client", we can check params.
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const callbackUrl = searchParams?.get('callbackUrl')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const payload = { ...data, callbackUrl: callbackUrl || undefined }
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Login failed")
      }

      if (responseData.redirect) {
         window.location.href = responseData.redirect
         return
      }

      if (responseData.twoFactor) {
        setShowTwoFactor(true)
      } else {
        toast.success("Logged in successfully")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Enter your email to sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {showTwoFactor && (
          <div className="space-y-2">
            <Label htmlFor="code">Two Factor Code</Label>
            <Input
              id="code"
              placeholder="123456"
              disabled={isLoading}
              {...register("code")}
            />
          </div>
        )}
        {!showTwoFactor && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </>
        )}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {showTwoFactor ? "Confirm" : "Sign In"}
        </Button>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" onClick={() => window.location.href = '/api/auth/github/login'}>
          <Icons.gitHub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button variant="outline" type="button" onClick={() => window.location.href = '/api/auth/google/login'}>
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>
      <div>
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
      <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              </div>
    </AuthLayout>
  )
}
