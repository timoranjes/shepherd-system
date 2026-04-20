import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getUserFromToken(accessToken: string) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

function getPathname(request: NextRequest): string {
  const url = new URL(request.url)
  return url.pathname
}

export async function updateSession(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value
  const pathname = getPathname(request)

  const isLoginPage = pathname === '/login'
  const isCallbackPage = pathname === '/auth/callback'
  const isPublicRoute = isLoginPage || isCallbackPage

  if (!accessToken && !isPublicRoute) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  let user = null
  if (accessToken) {
    user = await getUserFromToken(accessToken)
  }

  if (!user && !isPublicRoute) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
