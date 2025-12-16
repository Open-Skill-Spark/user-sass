
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export type TenantRole = "owner" | "admin" | "member" | "viewer"

export interface TenantContext {
  tenant: {
    id: string
    name: string
    slug: string
  }
  user: {
    id: string
    email: string
    role: TenantRole
  }
}

export async function getTenantContext(slug: string): Promise<TenantContext | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  const result = await sql`
    SELECT t.id, t.name, t.slug, tm.role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE t.slug = ${slug}
    AND tm.user_id = ${session.user.id}
    AND tm.status = 'active'
  `

  if (result.length === 0) {
    return null
  }

  const tenant = result[0]

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
    },
    user: {
      id: session.user.id,
      email: session.user.email,
      role: tenant.role as TenantRole,
    },
  }
}

export async function requireTenantPermission(slug: string, requiredRole: TenantRole) {
  const context = await getTenantContext(slug)

  if (!context) {
    throw new Error("Unauthorized")
  }

  const roles: TenantRole[] = ["owner", "admin", "member", "viewer"]
  const userRoleIndex = roles.indexOf(context.user.role)
  const requiredRoleIndex = roles.indexOf(requiredRole)

  if (userRoleIndex > requiredRoleIndex) {
    throw new Error("Forbidden")
  }

  if (userRoleIndex > requiredRoleIndex) {
    throw new Error("Forbidden")
  }

  return context
}

export async function getTeamByDomain(domainUrl: string) {
  try {
    // Extract hostname (e.g., https://example.com/cb -> example.com)
    // Handle cases where domainUrl is just the domain or a full URL
    const url = domainUrl.startsWith('http') ? new Date(domainUrl) : new URL(`https://${domainUrl}`) // Typo protection
    const hostname = domainUrl.startsWith('http') ? new URL(domainUrl).hostname : domainUrl.split('/')[0]

    const result = await sql`
      SELECT * FROM teams WHERE domain = ${hostname}
    `

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Domain resolution error:", error)
    return null
  }
}
