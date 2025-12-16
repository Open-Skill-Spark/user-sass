
import { NextResponse } from "next/server"
import { getProfileFromProvider, handleSocialLogin } from "@/lib/social-auth"
import { login } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    if (provider !== 'google' && provider !== 'github') {
        return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url))
    }

    // 1. Exchange Code for Profile
    const profile = await getProfileFromProvider(provider, code)
    if (!profile) {
        return NextResponse.redirect(new URL('/login?error=social_auth_failed', request.url))
    }

    // 2. Link or Create User
    try {
        const user = await handleSocialLogin({ ...profile, provider })
        
        // 3. Log them in (Session)
        await login({
            id: user.id,
            email: user.email,
            role: user.role,
            user_metadata: user.user_metadata,
            app_metadata: user.app_metadata
        })

        // 4. Redirect to Dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
        
    } catch (err) {
        console.error("Social Callback Error:", err)
        return NextResponse.redirect(new URL('/login?error=internal_error', request.url))
    }
}
