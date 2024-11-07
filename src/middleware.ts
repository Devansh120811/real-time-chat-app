import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    // console.log(token)
    const url = request.nextUrl

    if (!token && (url.pathname.startsWith('/chat') || url.pathname.startsWith('/profile') || url.pathname.startsWith('/forgot-password'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (token && (url.pathname === '/' || url.pathname === '/verify/:username*')) {
        return NextResponse.redirect(new URL('/chat', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/chat/:path*', '/verify/:path*', '/profile/:path*'],
}
