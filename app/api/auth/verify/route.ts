import { NextResponse } from "next/server"
import { decrypt } from "@/lib/auth"

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = await decrypt(token)
    return NextResponse.json({ user: payload.user })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
