import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const pathname = request.nextUrl.pathname

    // Determine if this route needs an auth check.
    // Skip getUser() on public pages to save Supabase API calls.
    const protectedRoutes = ['/profile']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = pathname.startsWith('/admin')
    const isAdminLoginRoute = pathname.startsWith('/admin/login')
    const authRoutes = ['/login', '/signup']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    const needsAuth = isProtectedRoute || isAdminRoute || isAuthRoute

    // Only call getUser() when the route actually requires auth.
    // This prevents burning Supabase tokens on every public page visit.
    if (!needsAuth) {
        supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        supabaseResponse.headers.set('X-Frame-Options', 'DENY')
        supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
        supabaseResponse.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://widget.trustpilot.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://goykebkdqjrgbofmusjv.supabase.co https://images.unsplash.com https://www.googletagmanager.com https://clarity.ms https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://goykebkdqjrgbofmusjv.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://v.clarity.ms; frame-src 'self' https://www.google.com https://widget.trustpilot.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;")
        return supabaseResponse
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Protect sensitive routes (customer)
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(url)
    }

    // Protect admin routes — must be logged in AND must be the admin email
    if (isAdminRoute && !isAdminLoginRoute) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail && user.email !== adminEmail) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Redirect logged in admin away from login page
    if (isAdminLoginRoute && user && user.email === process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Redirect logged in users away from auth pages
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Prevent browser/CDN caching of HTML pages so data is always fresh
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://widget.trustpilot.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://goykebkdqjrgbofmusjv.supabase.co https://images.unsplash.com https://www.googletagmanager.com https://clarity.ms https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://goykebkdqjrgbofmusjv.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://v.clarity.ms; frame-src 'self' https://www.google.com https://widget.trustpilot.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;")

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/ routes (handled by their own auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|api/).*)',
    ],
}
