import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check if Supabase environment variables are properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('your_supabase_project_url') || 
      supabaseAnonKey.includes('your_supabase_anon_key')) {
    // If Supabase is not configured, allow all requests to pass through
    // This prevents the middleware from crashing during development setup
    console.warn('Supabase environment variables not configured. Middleware authentication disabled.')
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/employee', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/admin-login']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    
    // Special handling for admin routes
    if (pathname.startsWith('/admin')) {
      redirectUrl.pathname = '/admin-login'
    }
    
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, get their profile to check role
  if (session && isProtectedRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Role-based route protection
        if (pathname.startsWith('/admin') && profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        
        if (pathname.startsWith('/employee') && profile.role !== 'employee') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        
        if (pathname.startsWith('/dashboard') && profile.role !== 'user') {
          // Redirect to appropriate dashboard based on role
          if (profile.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url))
          }
          if (profile.role === 'employee') {
            return NextResponse.redirect(new URL('/employee', req.url))
          }
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      // If there's an error getting profile, redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If user is authenticated and trying to access login/signup pages, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/admin-login')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Redirect to appropriate dashboard based on role
        switch (profile.role) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin', req.url))
          case 'employee':
            return NextResponse.redirect(new URL('/employee', req.url))
          case 'user':
          default:
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      // If error, redirect to user dashboard as fallback
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}