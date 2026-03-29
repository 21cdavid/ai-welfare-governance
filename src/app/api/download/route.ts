import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')
  if (!filePath) return NextResponse.json({ error: '경로가 없습니다.' }, { status: 400 })

  const { data, error } = await supabase.storage
    .from('seminar-files')
    .createSignedUrl(filePath, 3600)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.redirect(data.signedUrl)
}
