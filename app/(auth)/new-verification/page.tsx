"use client"

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Icons } from "@/components/ui/icons"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function NewVerificationContent() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()

  const onSubmit = useCallback(async () => {
    if (success || error) return

    if (!token) {
      setError("Missing token!")
      return
    }

    try {
      const response = await fetch("/api/auth/new-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong!")
      }

      setSuccess(data.success)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong!")
    }
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {!success && !error && <Icons.spinner className="h-8 w-8 animate-spin" />}
      
      {success && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-green-500">{success}</p>
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-red-500">{error}</p>
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function NewVerificationPage() {
  return (
    <AuthLayout
      title="Confirming your verification"
      description="Please wait while we verify your email address."
    >
      <Suspense fallback={<div className="flex w-full justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>}>
        <NewVerificationContent />
      </Suspense>
    </AuthLayout>
  )
}
