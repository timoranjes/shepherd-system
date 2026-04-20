const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
  user: {
    id: string
    email: string
    user_metadata?: Record<string, unknown>
  }
}

export interface SignUpResponse {
  id: string
  email: string
  confirmation_sent_at?: string
  user_metadata?: Record<string, unknown>
}

export interface UserResponse {
  id: string
  email: string
  user_metadata?: Record<string, unknown>
  role?: string
  created_at?: string
  updated_at?: string
}

async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${SUPABASE_URL}/auth/v1${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000),
  })

  return response
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await authFetch('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMsg = data.msg || data.error_description || data.error || '登入失敗'
    throw new Error(errorMsg)
  }

  return data
}

export async function signUp(
  email: string,
  password: string
): Promise<SignUpResponse> {
  const response = await authFetch('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMsg = data.msg || data.error_description || data.error || '註冊失敗'
    throw new Error(errorMsg)
  }

  return data
}

export async function getUser(accessToken: string): Promise<UserResponse> {
  const response = await authFetch('/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.msg || data.error_description || '獲取用戶資訊失敗')
  }

  return data
}

export async function signOut(accessToken: string): Promise<void> {
  await authFetch('/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
}

export function setAuthCookies(accessToken: string, refreshToken: string): void {
  if (typeof document === 'undefined') return

  const expires = new Date()
  expires.setDate(expires.getDate() + 7)

  document.cookie = `sb-access-token=${accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
  document.cookie = `sb-refresh-token=${refreshToken}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
}

export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return

  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(/sb-access-token=([^;]+)/)
  return match ? match[1] : null
}
