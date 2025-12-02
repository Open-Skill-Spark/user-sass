export type Role = "admin" | "user"

export interface User {
  id: string
  email: string
  role: Role
  created_at: Date
  updated_at: Date
}

export interface PasswordReset {
  token: string
  user_id: string
  expires_at: Date
  created_at: Date
}
