
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

  return context
}
