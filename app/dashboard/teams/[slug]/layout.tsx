
import { notFound, redirect } from "next/navigation"
import { getTenantContext } from "@/lib/tenant"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const context = await getTenantContext(slug)

  if (!context) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}
