import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })

  const res = NextResponse.json({ success: true })
  res.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24
  })
  res.cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('sb-access-token')
  res.cookies.delete('sb-refresh-token')
  return res
}
