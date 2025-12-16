
import { NextResponse } from "next/server"
import { getOAuthStartUrl } from "@/lib/social-auth"

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params
    
    if (provider !== 'google' && provider !== 'github') {
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    const url = getOAuthStartUrl(provider)
    return NextResponse.redirect(url)
}
