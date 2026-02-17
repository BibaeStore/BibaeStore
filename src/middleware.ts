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

    const { data: { user } } = await supabase.auth.getUser()

    // Protect sensitive routes (customer)
    const protectedRoutes = ['/profile']
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Protect admin routes — must be logged in AND must be the admin email
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    if (isAdminRoute) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail && user.email !== adminEmail) {
            // Authenticated but not admin — redirect to home
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Redirect logged in users away from auth pages
    const authRoutes = ['/login', '/signup']
    const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Prevent browser/CDN caching of HTML pages so data is always fresh
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
